package com.ddctalk.ddctalk.ux;

import javax.baja.naming.BOrd;
import javax.baja.nre.annotations.NiagaraSingleton;
import javax.baja.nre.annotations.NiagaraType;
import javax.baja.sys.Sys;
import javax.baja.sys.Type;
import javax.baja.web.js.BJsBuild;

@NiagaraType
@NiagaraSingleton
public final class BDdctalkJsBuild extends BJsBuild
{
  private BDdctalkJsBuild()
  {
    super("ddctalk", BOrd.make("module://ddctalk/rc/ddctalk.built.min.js"), BDdctalkCssResource.TYPE);
  }
}
