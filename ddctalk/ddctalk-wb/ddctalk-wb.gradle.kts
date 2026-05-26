/*
 * Copyright 2026 ddctalk. All Rights Reserved.
 */

import com.tridium.gradle.plugins.bajadoc.task.Bajadoc
import com.tridium.gradle.plugins.module.util.ModulePart.RuntimeProfile.*

plugins {
  id("com.tridium.niagara-module")
  id("com.tridium.niagara-signing")
  id("com.tridium.bajadoc")
  id("com.tridium.niagara-jacoco")
  id("com.tridium.niagara-annotation-processors")
  id("com.tridium.convention.niagara-home-repositories")
}

description = "ddctalk workbench module"

moduleManifest {
  moduleName.set("ddctalk")
  runtimeProfile.set(wb)
}

dependencies {
  // NRE dependencies
  nre(":nre")

  // Servlet API is provided by the platform at runtime; needed only for compilation.
  compileOnly(files("${project.findProperty("niagara_home")}\\bin\\ext\\javax.servlet-api-3.1.0.jar"))

  // Niagara module dependencies
  api(":baja")
  api(":web-rt")
  api(":workbench-wb")
  api(":bajaui-wb")
  api(":hx-wb")
  api(":webEditors-ux")
  api(":bajaux-ux")
  api(":js-ux")

  // Module dependency
  api(project(":ddctalk-rt"))
}

tasks.named<Bajadoc>("bajadoc") {
  includePackage("com.ddctalk.ddctalk.ui")
}
