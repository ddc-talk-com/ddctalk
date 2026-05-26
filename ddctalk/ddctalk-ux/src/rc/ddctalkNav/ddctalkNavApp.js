/**
 * @copyright 2026, ddc-talk.com, some rights reserved.
 * @author Daniel Rose (add more, when contributing) 
 */
define([
    "baja!",
    "jquery"],
    function (
        baja,
        $
    ) {
        let ddctalkNavApp = {
            // Constants
            SESSION_URL: null,
            DOMAIN: null,
            FULLSCREEN: "|view:?fullScreen=true",
            IDENTIFIER: 0
        };

        /**
         * Gets the current URL and removes the "cutOff" prefix
         * 
         * @returns {String} newUrl
         */
        ddctalkNavApp.getUrl = function getUrl(cutOff) {
            let currentUrl = window.location.href;

            // Display the URL in the console
            console.log("Current URL: ", currentUrl);

            // Find the index of "cutOff" in the string
            let index = currentUrl.indexOf(cutOff);

            if (index !== -1) {
                // Extract the substring before cutOff
                let newUrl = currentUrl.substring(0, index);

                console.log("Modified Url: ", newUrl);
                return newUrl + "ord/";
            } else {
                console.error("Cutoff not found in URL");
                return null;
            }
        };
        function toOrdUrl(ordExpression) {
            const base = ddctalkNavApp.DOMAIN || '/ord/';
            return `${base}${encodeURIComponent(ordExpression)}`;
        }

        ddctalkNavApp.initApp = async function () {
            try {
                const mainFrame = document.getElementById('mainFrame');
                console.log(mainFrame.src);
                // if (mainFrame) {
                //     mainFrame.src = toOrdUrl(mainFrame.src + '?|view:') + '?fullScreen=true';
                // }

                // 1. Get current user
                const user = baja.getUserName();
                // let user = "Dakota Skye"
                if (user) {
                    const userInfo = document.getElementById('userInfo');
                    if (userInfo) userInfo.textContent = user;
                }

                function update(user) {
                    console.log("UPDATE FUNCTION");
                    console.log("User: ", user);
                    if (user.get("fullName") === "") {
                        $("#userInfo").text(user);
                    } else {
                        $("#userInfo").text(user.get("fullName"));
                    }
                }

                let sub = new baja.Subscriber();

                const userPath = `station:|slot:/Services/UserService/${user}`;
                console.log(userPath);

                baja.Ord.make(userPath).get({ subscriber: sub })
                    .then((user) => {
                        update(user);
                    });

                // Setup mobile menu toggle
                const menuToggle = document.getElementById('menuToggle');
                if (menuToggle) {
                    menuToggle.addEventListener('click', () => {
                        const sidebarNav = document.getElementById('sidebarNav');
                        if (sidebarNav) sidebarNav.classList.toggle('open');
                    });
                }

                let navName = "default";

                try {
                    // Get the user's properties to check their navFile
                    const userObj = await baja.Ord.make("user:").get();
                    const navOrdStr = userObj.get("navFile") ? userObj.get("navFile").toString() : "";

                    if (navOrdStr && navOrdStr.indexOf(".nav") > 0) {
                        const parts = navOrdStr.split("/");
                        const filename = parts[parts.length - 1]; // e.g., "acme.nav"
                        navName = filename.replace(".nav", "");
                    }
                } catch (e) {
                    console.warn("Could not determine specific nav file name from user properties, falling back to default.", e);
                }

                // 3. Load Config
                await loadConfig(navName);

                // 4. Load Nav Tree
                await loadNavTree(navName);

            } catch (err) {
                console.error("Initialization failed:", err);
            }
        };

        async function loadConfig(navName) {
            let configStr = "";
            try {
                // Try specific config
                configStr = await fetchFileText(toOrdUrl(`station:|slot:/Files/ddctalkNav/config/${navName}.json`));
            } catch (e) {
                console.log(`Config ${navName}.json not found, trying default.json`);
                try {
                    configStr = await fetchFileText(toOrdUrl('station:|slot:/Files/ddctalkNav/config/default.json'));
                } catch (fallbackErr) {
                    console.error("Could not load any config file.", fallbackErr);
                    return;
                }
            }

            if (configStr) {
                try {
                    const config = JSON.parse(configStr);
                    applyConfig(config);
                } catch (e) {
                    console.error("Failed to parse config JSON", e);
                }
            }
        }

        // Helper to fetch file content via Baja's standard HTTP ORDs
        function fetchFileText(url) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error(`HTTP ${xhr.status} fetching ${url}`));
                    }
                };
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send();
            });
        }

        function applyConfig(config) {
            const root = document.documentElement;

            // Apply colors
            if (config.colors) {
                if (config.colors.bg) root.style.setProperty('--bg-base', config.colors.bg);
                if (config.colors.text) root.style.setProperty('--text-primary', config.colors.text);
                if (config.colors.headerBg) root.style.setProperty('--glass-bg', config.colors.headerBg);
                if (config.colors.accent) root.style.setProperty('--accent-primary', config.colors.accent);
            }

            // Apply sizes
            if (config.sizes) {
                if (config.sizes.headerHeight) root.style.setProperty('--header-height', config.sizes.headerHeight);
                if (config.sizes.sidebarWidth) root.style.setProperty('--sidebar-width', config.sizes.sidebarWidth);
            }

            // Header info (e.g., ORDs to read)
            if (config.headerInfo) {
                const headerValuesContainer = document.getElementById('headerValues');
                if (headerValuesContainer) {
                    headerValuesContainer.innerHTML = ''; // clear

                    config.headerInfo.forEach(item => {
                        const chip = document.createElement('div');
                        chip.className = 'info-chip';

                        const icon = document.createElement('i');
                        icon.className = item.icon || 'ph ph-info';
                        chip.appendChild(icon);

                        const textSpan = document.createElement('span');
                        textSpan.textContent = `${item.label}: Loading...`;
                        chip.appendChild(textSpan);

                        headerValuesContainer.appendChild(chip);

                        // Subscribe to the ORD using BajaScript
                        const sub = new baja.Subscriber();
                        baja.Ord.make(item.ord).get({ subscriber: sub })
                            .then(obj => {
                                // For ControlPoints, get the out slot
                                const out = obj.get("out") || obj;
                                textSpan.textContent = `${item.label}: ${out.getValueDisplay ? out.getValueDisplay() : out.toString()}`;

                                // Setup subscription
                                sub.attach("changed", function (prop) {
                                    if (prop.getName() === "out" || prop.getName() === "value") {
                                        const newOut = obj.get("out") || obj;
                                        textSpan.textContent = `${item.label}: ${newOut.getValueDisplay ? newOut.getValueDisplay() : newOut.toString()}`;
                                    }
                                });
                            })
                            .catch(err => {
                                textSpan.textContent = `${item.label}: Error`;
                            });
                    });
                }
            }
        }

        async function loadNavTree(navName) {
            const navRootContainer = document.getElementById('navTreeRoot');
            if (!navRootContainer) return;

            navRootContainer.innerHTML = '<li class="nav-item loading-skeleton"><a class="nav-link"><i class="ph ph-spinner-gap node-icon" style="animation: spin 1s linear infinite;"></i> Loading navigation...</a></li>';

            try {
                // Read the nav file directly as requested by user fallback mechanism
                let navXmlStr = "";
                try {
                    navXmlStr = await fetchFileText(toOrdUrl(`station:|slot:/Files/ddctalkNav/nav/${navName}.nav`));
                } catch (e) {
                    console.log(`Nav ${navName}.nav not found, trying default.nav`);
                    navXmlStr = await fetchFileText(toOrdUrl('station:|slot:/Files/ddctalkNav/nav/default.nav'));
                }

                navRootContainer.innerHTML = '';

                // Parse the XML
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(navXmlStr, "text/xml");
                const rootNodes = xmlDoc.querySelectorAll("node"); // Assuming standard Niagara Nav XML structure

                if (rootNodes.length === 0) {
                    navRootContainer.innerHTML = '<li class="nav-item loading-skeleton"><a class="nav-link">Empty navigation</a></li>';
                    return;
                }

                // We'll process only top-level nodes under the root <nav> element
                const topNodes = xmlDoc.documentElement.children;
                for (let i = 0; i < topNodes.length; i++) {
                    if (topNodes[i].tagName === "node") {
                        buildNavDOMFromXML(topNodes[i], navRootContainer);
                    }
                }

            } catch (e) {
                console.error("Failed to load nav tree:", e);
                navRootContainer.innerHTML = '<li class="nav-item loading-skeleton"><a class="nav-link"><i class="ph ph-warning node-icon"></i> Error loading navigation</a></li>';
            }
        }

        function buildNavDOMFromXML(xmlNode, containerElement) {
            const li = document.createElement('li');
            li.className = 'nav-item';

            const a = document.createElement('a');
            a.className = 'nav-link';

            // Get node title (usually 'name' attribute or 'displayName')
            const navName = xmlNode.getAttribute('name') || xmlNode.getAttribute('displayName') || "Node";
            const ord = xmlNode.getAttribute('ord');
            const view = xmlNode.getAttribute('view') || "hx:PxView";

            // Add icon
            const icon = document.createElement('i');
            icon.className = 'ph ph-folder node-icon'; // Default to folder
            // If it has an ord, make it a file or chart icon
            if (ord) {
                if (ord.includes('histories')) icon.className = 'ph ph-chart-line-up node-icon';
                else if (ord.includes('baja:')) icon.className = 'ph ph-sliders-horizontal node-icon';
                else if (ord.includes('alarm:')) icon.className = 'ph ph-bell-ringing node-icon';
                else icon.className = 'ph ph-file-text node-icon';
            }

            a.appendChild(icon);

            const textSpan = document.createElement('span');
            textSpan.textContent = navName;
            a.appendChild(textSpan);

            if (ord) {
                // Resolve target view
                let targetOrdUrl = toOrdUrl(`${ord}|view:${view}`);
                a.href = targetOrdUrl + (targetOrdUrl.includes('?') ? '&iframe=true' : '?iframe=true');
                a.target = "mainFrame";

                // Active state handling
                a.addEventListener('click', function () {
                    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
                    a.classList.add('active');
                    const pageTitle = document.getElementById('pageTitle');
                    if (pageTitle) pageTitle.textContent = navName;

                    // Close sidebar on mobile after clicking a link
                    if (window.innerWidth <= 768) {
                        const sidebarNav = document.getElementById('sidebarNav');
                        if (sidebarNav) sidebarNav.classList.remove('open');
                    }
                });
            } else {
                a.href = "javascript:void(0)";
            }

            li.appendChild(a);

            // Process children
            const children = Array.from(xmlNode.children).filter(el => el.tagName === 'node');

            if (children.length > 0) {
                const subUl = document.createElement('ul');

                // Add toggle icon
                const toggle = document.createElement('i');
                toggle.className = 'ph ph-caret-right toggle-icon';
                a.appendChild(toggle);
                a.setAttribute('aria-expanded', 'false');

                a.onclick = (e) => {
                    // if it's just a folder without an ord, prevent default
                    if (!ord) e.preventDefault();

                    subUl.classList.toggle('expanded');
                    const isExpanded = subUl.classList.contains('expanded');
                    a.setAttribute('aria-expanded', isExpanded);

                    // Toggle folder icon
                    if (!ord) {
                        icon.className = isExpanded ? 'ph ph-folder-open node-icon' : 'ph ph-folder node-icon';
                    }
                };

                children.forEach(child => buildNavDOMFromXML(child, subUl));
                li.appendChild(subUl);
            }

            containerElement.appendChild(li);
        }

        return ddctalkNavApp;
    });