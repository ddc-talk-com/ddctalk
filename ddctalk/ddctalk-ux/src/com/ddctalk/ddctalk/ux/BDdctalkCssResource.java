package com.ddctalk.ddctalk.ux;

import javax.baja.naming.BOrd;
import javax.baja.nre.annotations.NiagaraSingleton;
import javax.baja.nre.annotations.NiagaraType;
import javax.baja.sys.Sys;
import javax.baja.sys.Type;
import javax.baja.web.js.BCssResource;

@NiagaraType
@NiagaraSingleton
public final class BDdctalkCssResource extends BCssResource
{
  private BDdctalkCssResource()
  {
    super(BOrd.make("module://ddctalk/rc/ddctalk.css"));
  }
}
