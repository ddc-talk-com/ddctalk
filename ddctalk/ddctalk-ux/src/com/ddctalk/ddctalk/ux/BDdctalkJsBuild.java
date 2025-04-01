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
//region /*+ ------------ BEGIN BAJA AUTO GENERATED CODE ------------ +*/
//@formatter:off
/*@ $com.ddctalk.ddctalk.ux.BDdctalkJsBuild(2747097003)1.0$ @*/
/* Generated Tue Apr 01 20:15:45 CEST 2025 by Slot-o-Matic (c) Tridium, Inc. 2012-2025 */

  public static final BDdctalkJsBuild INSTANCE = new BDdctalkJsBuild();

  //region Type

  @Override
  public Type getType() { return TYPE; }
  public static final Type TYPE = Sys.loadType(BDdctalkJsBuild.class);

  //endregion Type

//@formatter:on
//endregion /*+ ------------ END BAJA AUTO GENERATED CODE -------------- +*/
  private BDdctalkJsBuild()
  {
    super("ddctalk", BOrd.make("module://ddctalk/rc/ddctalk.built.min.js"), BDdctalkCssResource.TYPE);
  }
}
