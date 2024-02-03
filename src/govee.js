/**
 * Govee H5075 Temperature + Humidity BLE Sensor
 * Methods for polling and parsing data from the sensor.
 *
 * Based on the discussion here,
 * https://community.home-assistant.io/t/read-govee-temperature-humidity-ble-advertisements-with-esp32-and-esphome/230449/11
 */
let Govee = {
  H5075: {
    poll_once: function (addr, callback) {
      Govee.H5075.poll(addr, function (data) {
        BLE.Scanner.Stop();
        callback(data);
      });
    },
    poll: function (addr, callback) {
      BLE.Scanner.Start(
        {
          duration_ms: BLE.Scanner.INFINITE_SCAN,
          active: false
        },
        function (e, r) {
          if (e != BLE.Scanner.SCAN_RESULT) return;
          if (r.addr !== addr) return;
          if (r.manufacturer_data.ec88) {
            let sensors = Govee.H5075.parse(r.manufacturer_data.ec88);
            callback(sensors);
          }
        });
    },
    parse: function (data) {
      let basenum = (data.at(1) << 16) + (data.at(2) << 8) + data.at(3);
      let temp = basenum / 10000.0;
      return {
        timestamp: Date.now(),
        temp_c: temp,
        temp_f: ((temp * 9 / 5) + 32),
        humidity: (basenum % 1000) / 10.0,
        battery: data.at(4) / 1.0,
      };
    }
  }
};

// Example call
// Govee.H5075.poll("a4:c1:38:5c:39:f2", console.log);
