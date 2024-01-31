/**
 * Shelly script for automatically re-enabling and restarting all existing scripts.
 * This is to work around times when scripts are stopped (due to some error?).
 */
function enableAllScripts() {
    Shelly.call("Script.List", {}, function (result) {
        for (var i in result.scripts) {
            let s = result.scripts[i];
            console.log("Restarting script: [" + s.id + "] " + s.name);
            Shelly.call("Script.SetConfig", { id: s.id, config: { enable: true } });
            Shelly.call("Script.Start", { id: s.id });
        }
    });
}

function registerSchedule() {
    let schedule = {
        timespec: "0 0 * * * *",
        calls: [{
            method: "Script.Eval",
            params: {
                id: Shelly.getCurrentScriptId(),
                code: "enableAllScripts()"
            }
        }]
    };
    Shelly.call("Schedule.Create", schedule, function (e) { console.log(e); });
}

// First time, create a schedule that will keep re-enabling scripts
// registerSchedule();
