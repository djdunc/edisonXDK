/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

var mraa = require('mraa');
var dgram = require('dgram');
var client = dgram.createSocket('udp4');

var myOnboardLed = new mraa.Gpio(13);
myOnboardLed.dir(mraa.DIR_OUT);
var ledState = true;

var light_sensor = new mraa.Aio(1);
var temp_sensor = new mraa.Aio(0);
var sound_sensor = new mraa.Aio(3);


main();

function main() {

    //blink LED on board
    myOnboardLed.write(ledState ? 1 : 0);
    ledState = !ledState;

    //get light value
    var light_val = getLight();

    //get temp value
    var temp_val = getTemp();

    //get sound value
    var sound_val = getSound();

    console.log("L: " + light_val + " T: " + temp_val + " S: " + sound_val);


    send_data("Light",light_val);
    send_data("temperature",temp_val);
    send_data("Sound",sound_val);

    setTimeout(main, 10000);
}

function send_data(x, y) {

    var msg = JSON.stringify({ n: x, v: y });
    var sentMsg = new Buffer(msg);
    console.log("Data Sent: " + sentMsg);
    client.send(sentMsg, 0, sentMsg.length, 41234, '127.0.0.1');

}

function getLight() {
    // Read the input and print both the raw value and a rough lux value,
    // waiting one second between readings
    var light_reading = light_sensor.read();

    return (light_reading);
}

function getTemp() {
    var t = 0;
    var n = 100;
    var temp_const = 3975;


    for (var thisReading = 0; thisReading < n; thisReading++) {
        var a = temp_sensor.read();
        var resistance = (1023 - a) * 10000 / a;
        var temp_val = 1 / (Math.log(resistance / 10000) / temp_const + 1 / 298.15) - 273.15;

        temp_val = temp_val.toFixed(2);
        t = t + parseInt(temp_val, 10);

    }

    t = (t / n);

    return t;
}

function getSound() {
    var sound_val;
    var sound_total = 0;
    var n = 1000;
    
    for (var i = 0; i < n; i++) {
        sound_val = sound_sensor.read();
        sound_total = sound_total + sound_val;
    }
    sound_val = sound_total / n;
    //sound_val = sound_val * (5.0 / 1023.0) * 100000;
    //sound_val = 20 * Math.log(sound_val / 5.0);
    sound_val = sound_val.toFixed(0);

    return (sound_val);
}