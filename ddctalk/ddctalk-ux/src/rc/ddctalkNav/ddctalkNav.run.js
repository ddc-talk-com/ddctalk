require([
    "baja!",
    "jquery",
    "nmodule/ddctalk/rc/ddctalkNav/ddctalkNavApp"],
    function (
        baja,
        $,
        ddctalkNavApp) {

        console.log("Starting ddctalkNav.");
        $(document).ready(function () {
            console.log("Document ready.");
            ddctalkNavApp.SESSION_URL = ddctalkNavApp.getUrl("/module/");
            ddctalkNavApp.DOMAIN = ddctalkNavApp.getUrl("module/");

            baja.started(function () {
                ddctalkNavApp.initApp();
            });
        });
    });