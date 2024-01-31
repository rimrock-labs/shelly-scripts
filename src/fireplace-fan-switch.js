/*
A Shelly Plus 1PM script for monitoring the power usage of a gas fireplace and then toggling a separate Shelly Plus 1 switch that controls an overhead fan (on or off) to push hot air down.
This script relies on several KVS values being set in your shelly.
You can set them in KVS or populate them directly in the context below.

This script also uses the Shelly Cloud to discover the IP of the other switch.
You will need to use the Shelly Cloud to generate and store the auth key to perform this.
Otherwise hardcode the ip of the switch on your local network.
*/

let context = {
    log_prefix: "[" + Shelly.getCurrentScriptId() + "] ",
    cloud_endpoint: null,
    cloud_auth_key: null,
    fan_switch_id: null,
    fan_switch_ip: null,
};

function getFanSwitchIp(e) {
    if (typeof e.code !== "undefined" &&
        e.code == 200) {
        let body = JSON.parse(e.body);
        context.fan_switch_ip = body.data.device_status.wifi.sta_ip;
        console.log(context.log_prefix + "Discovered " + context.fan_switch_id + " -> " + context.fan_switch_ip);
    }
    else {
        console.log(context.log_prefix + "Unable to reach Shelly cloud!");
    }
}

function discoverFanSwitchIp() {
    Shelly.call(
        "HTTP.GET",
        { "url": "https://" + context.cloud_endpoint + "/device/status?auth_key=" + context.cloud_auth_key + "&id=" + context.fan_switch_id },
        getFanSwitchIp);
}

function getKVSVariables(e) {
    context.cloud_endpoint = e.items.cloud_endpoint.value;
    context.cloud_auth_key = e.items.cloud_auth_key.value;
    context.fan_switch_id = e.items.fan_switch_id.value;
    console.log(context.log_prefix + "Got KVS variables.");
    discoverFanSwitchIp();
}

function init() {
    Shelly.call(
        "KVS.GetMany",
        {},
        getKVSVariables);

    Shelly.addStatusHandler(function (e) {
        if (typeof e.name !== "undefined" &&
            e.name == "switch") {
            let status = Shelly.getComponentStatus(e.component);
            let isFanOn = status.apower > 5;

            if (context.fan_switch_ip) {
                console.log(context.log_prefix + "Updating Ceiling Fan: " + isFanOn);
                Shelly.call(
                    "HTTP.GET",
                    { "url": "http://" + context.fan_switch_ip + "/rpc/Switch.Set?id=0&on=" + isFanOn });
            }
            else {
                console.log(context.log_prefix + "Fan switch IP not yet set.");
            }
        }
    });
}

init();
