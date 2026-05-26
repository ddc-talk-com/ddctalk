package com.ddctalk.ddctalk.ux;

import javax.baja.naming.BOrd;
import javax.baja.nre.annotations.NiagaraSingleton;
import javax.baja.nre.annotations.NiagaraType;
import javax.baja.sys.BSingleton;
import javax.baja.sys.Context;
import javax.baja.sys.Sys;
import javax.baja.sys.Type;
import javax.baja.web.BIFormFactorMax;
import javax.baja.web.js.BIJavaScript;
import javax.baja.web.js.JsInfo;

@NiagaraType
@NiagaraSingleton
public final class BDdctalkNav
        extends BSingleton
        implements BIJavaScript, BIFormFactorMax {
    // region /*+ ------------ BEGIN BAJA AUTO GENERATED CODE ------------ +*/
//@formatter:off
/*@ $com.ddctalk.ddctalk.ux.BDdctalkNav(2747097003)1.0$ @*/
/* Generated Mon May 25 02:44:59 CEST 2026 by Slot-o-Matic (c) Tridium, Inc. 2012-2026 */

  public static final BDdctalkNav INSTANCE = new BDdctalkNav();

  //region Type

  @Override
  public Type getType() { return TYPE; }
  public static final Type TYPE = Sys.loadType(BDdctalkNav.class);

  //endregion Type

//@formatter:on
    // endregion /*+ ------------ END BAJA AUTO GENERATED CODE -------------- +*/

    private BDdctalkNav() {
    }

    public JsInfo getJsInfo(Context cx) {
        return jsInfo;
    }

    private static final JsInfo jsInfo = JsInfo.make(
            BOrd.make("module://ddctalk/rc/ddctalkNav/ddctalkNav.run.js"),
            BDdctalkJsBuild.TYPE);
}
