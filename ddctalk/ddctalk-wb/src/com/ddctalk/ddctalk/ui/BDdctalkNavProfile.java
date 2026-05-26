package com.ddctalk.ddctalk.ui;

import javax.baja.nre.annotations.NiagaraType;
import javax.baja.nre.annotations.NiagaraSingleton;
import com.tridium.hx.BHTML5HxProfile;
import javax.baja.sys.Sys;
import javax.baja.sys.Type;

/**
 * Custom HTML5 Hx profile for ddctalk navigation.
 * Extends BHTML5HxProfile to support modern Px views correctly.
 */
@NiagaraType
@NiagaraSingleton
public class BDdctalkNavProfile extends BHTML5HxProfile {
//region /*+ ------------ BEGIN BAJA AUTO GENERATED CODE ------------ +*/
//@formatter:off
/*@ $com.ddctalk.ddctalk.ui.BDdctalkNavProfile(2979906276)1.0$ @*/
/* Generated Mon May 11 14:42:33 CEST 2026 by Slot-o-Matic (c) Tridium, Inc. 2012-2026 */

  //region Type

  public static final BDdctalkNavProfile INSTANCE = new BDdctalkNavProfile();
  public static final Type TYPE = Sys.loadType(BDdctalkNavProfile.class);

  @Override
  public Type getType() { return TYPE; }

  //endregion Type

//@formatter:on
//endregion /*+ ------------ END BAJA AUTO GENERATED CODE -------------- +*/

    protected BDdctalkNavProfile() {}

    @Override
    public void writeDocument(javax.baja.hx.BHxView view, javax.baja.hx.HxOp op) throws Exception {
        // Check if this request is explicitly meant for our iframe
        String iframeParam = op.getRequest().getParameter("iframe");
        
        if (iframeParam == null || !iframeParam.equals("true")) {
            // Not in our iframe! This is a top-level load (e.g. login).
            // Redirect to our custom HTML frontend.
            op.getResponse().sendRedirect("/module/ddctalk/rc/ddctalkNav/index.html");
            return;
        }
        
        // Render the modern HTML5 view as normal for the iframe
        super.writeDocument(view, op);
    }

    @Override
    public javax.baja.sys.BValue getConfig(String key) {
        // Disable Niagara's default sidebars and trees because we have our own!
        if (key != null) {
            String k = key.toLowerCase();
            if (k.contains("sidebar") || k.contains("tree")) {
                return javax.baja.sys.BBoolean.FALSE;
            }
        }
        return super.getConfig(key);
    }
}
