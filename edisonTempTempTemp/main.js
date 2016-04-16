/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

/*
A simple node.js application intended to read data from Analog pins on the Intel based development boards such as the Intel(R) Galileo and Edison with Arduino breakout board.

MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.

Steps for installing MRAA & UPM Library on Intel IoT Platform with IoTDevKit Linux* image
Using a ssh client: 
1. echo "src maa-upm http://iotdk.intel.com/repos/1.1/intelgalactic" > /etc/opkg/intel-iotdk.conf
2. opkg update
3. opkg upgrade

Article: https://software.intel.com/en-us/html5/articles/intel-xdk-iot-edition-nodejs-templates
*/

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console

var dgram = require('dgram');
var client = dgram.createSocket('udp4');

var myOnboardLed = new mraa.Gpio(13);
myOnboardLed.dir(mraa.DIR_OUT);
var ledState = true;

var t = new mraa.Aio(0);
var t1 = new mraa.Aio(1);
var t2 = new mraa.Aio(3);

var lcd = require('jsupm_i2clcd');
var display = new lcd.Jhd1313m1(0, 0x3E, 0x62);

main();

function main() {

    //blink LED on board
    myOnboardLed.write(ledState ? 1 : 0);
    ledState = !ledState;

    //get temp value
    var t_val = getTemp(t);
    var t1_val = getTemp(t1);
    var t2_val = getTemp(t2);


    console.log("T1: " + t_val + " T2: " + t1_val + " T2: " + t2_val);

    display.setCursor(0, 0);
    display.write('3 Temps: ' + t_val.toFixed(1));
    display.setCursor(1,0);
    display.write('T1:' + t1_val.toFixed(1) + ' T2:' + t2_val.toFixed(1));

    send_data("temperature",t_val);
    send_data("temperature1",t1_val);
    send_data("temperature2",t2_val);
    
    setTimeout(main, 60000);
}

function send_data(x, y) {

    var msg = JSON.stringify({ n: x, v: y });
    var sentMsg = new Buffer(msg);
    console.log("Data Sent: " + sentMsg);
    client.send(sentMsg, 0, sentMsg.length, 41234, '127.0.0.1');

}

function getTemp(sensor) {
    var t = 0;
    var n = 100;
    var temp_const = 3975;


    for (var thisReading = 0; thisReading < n; thisReading++) {
        var a = sensor.read();
        var resistance = (1023 - a) * 10000 / a;
        var temp_val = 1 / (Math.log(resistance / 10000) / temp_const + 1 / 298.15) - 273.15;

        temp_val = temp_val.toFixed(2);
        t = t + parseInt(temp_val, 10);

    }

    t = (t / n);

    return t;
}