/*
 iot package
*/
//% weight=10 icon="\uf013" color=#ff7f00
namespace iot {
    export enum Lights {
        //% block="Light 1"
        Light1 = 0x01,
        //% block="Light 2"
        Light2 = 0x02,
        //% block="All"
        All = 0x03
    }

    export enum iicPort2 {
        //% block="port 4"
        port4 = 0x04,
        //% block="port 5"
        port5 = 0x05,
        //% block="port 6"
        port6 = 0x06
    }

    export enum iicPort {
        //% block="port 4"
        port4 = 0x04,
        //% block="port 5"
        port5 = 0x05,
        //% block="port 6"
        port6 = 0x06,
        //% block="iic extend"
        iic_extend = 0x07
    }

    export enum iicAdcPort {
        //% block="port 1"
        iic_adc_1 = 0x01,
        //% block="port 2"
        iic_adc_2 = 0x03,
        //% block="port 3"
        iic_adc_3 = 0x05,
        //% block="port 4"
        iic_adc_4 = 0x07
    }

    export enum ioPort {
        //% block="port 1"
        port1 = 0x01,
        //% block="port 2"
        port2 = 0x02
    }

    export enum water_pumPort {
        //% block="M1"
        M1 = 0x01,
        //% block="M2"
        M2 = 0x02
    }

    export enum Temp_humi {
        //% block="Temperature"
        Temperature = 0x01,
        //% block="Humidity"
        Humidity = 0x02
    }

    let rgbLight: RGBLight.LHRGBLight;

    let handleCmd: string = "";
    let batVoltage: number = 0;
    let distanceBak: number = 0;

    const INVALID_PORT = 0xff;
    let fanPort = INVALID_PORT;
    let ultraPort = INVALID_PORT;
    let tempHumiPort = INVALID_PORT;
    let wifiPort = INVALID_PORT;
    let iicExtendPort = INVALID_PORT;
    let waterpumPort = INVALID_PORT;
    let rgbPort = INVALID_PORT;
    let soilPort = INVALID_PORT;
    let brightnessPort = INVALID_PORT;
    let rainwaterPort = INVALID_PORT;

    function mapRGB(x: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    /**
     * IoTHouse initialization, please execute at boot time
    */
    //% weight=100 blockId=iothouse_init block="Initialize IoTHouse"
    //% subcategory=Init
    export function iothouse_init() {
        // initColorSensor();
        serial.redirect(
            SerialPin.P12,
            SerialPin.P8,
            BaudRate.BaudRate115200);
        basic.forever(() => {
            getHandleCmd();
        });
    }

    /**
     * Fan module initialization, please execute at boot time
    */
    //% weight=98 blockId=fan_init block="Initialize fan module %port"
    //% subcategory=Init
    export function fan_init(port: iicPort) {
        fanPort = port;
    }

    /**
     * Ultrasonic initialization, please execute at boot time
    */
    //% weight=96 blockId=ultrasonic_init block="Initialize ultrasonic sensor %port"
    //% subcategory=Init
    export function ultrasonic_init(port: ioPort) {
        ultraPort = port;
    }

    /**
     * Temperature and humidity sensor initialization, please execute at boot time
    */
    //% weight=94 blockId=temphumidity_init block="Initialize temperature and humidity sensor %port"
    //% subcategory=Init
    export function temphumidity_init(port: iicPort) {
        tempHumiPort = port;
    }

    /**
     * Wifi module initialization, please execute at boot time
    */
    //% weight=92 blockId=wifi_init block="Initialize wifi module %port"
    //% subcategory=Init
    export function wifi_init(port: iicPort) {
        wifiPort = port;
    }
    /**
     * iic extend board initialization, please execute at boot time
    */
    //% weight=90 blockId=iicExtend_init block="Initialize iic extend board %port"
    //% subcategory=Init
    export function iicExtend_init(port: iicPort2) {
        iicExtendPort = port;
    }

    /**
     * Soil moisture sensor initialization, please execute at boot time
    */
    //% weight=88 blockId=soilMoisture_init block="Initialize soil moisture sensor at  IIC ADC module %port"
    //% subcategory=Init
    export function soilMoisture_init(port: iicAdcPort) {
        soilPort = port;
    }

    /**
     * Brightness sensor initialization, please execute at boot time
    */
    //% weight=86 blockId=brightness_init block="Initialize brightness sensor  at  IIC ADC module  %port"
    //% subcategory=Init
    export function brightness_init(port: iicAdcPort) {
        brightnessPort = port;
    }

    /**
     * Rainwater sensor initialization, please execute at boot time
    */
    //% weight=85 blockId=rainwater_init block="Initialize rainwater sensor  at  IIC ADC module  %port"
    //% subcategory=Init
    export function rainwater_init(port: iicAdcPort) {
        rainwaterPort = port;
    }

    /**
    * Waterpum initialization, please execute at boot time
   */
    //% weight=84 blockId=waterpum_init block="Initialize waterpum %port"
    //% subcategory=Init
    export function waterpum_init(port: water_pumPort) {
        waterpumPort = port;
    }

    /**
     * RGB module initialization, please execute at boot time
    */
    //% weight=83 blockId=rgb_init block="Initialize RGB module %port"
    //% subcategory=Init
    export function rgb_init(port: ioPort) {
        rgbPort = port;
        initRGBLight();
    }

    /**
    * Get the handle command.
    */
    function getHandleCmd() {
        let charStr: string = serial.readString();
        handleCmd = handleCmd.concat(charStr);
        let cnt: number = countChar(handleCmd, "$");
        if (cnt == 0)
            return;
        let index = findIndexof(handleCmd, "$", 0);
        if (index != -1) {
            let cmd: string = handleCmd.substr(0, index);
            if (cmd.charAt(0).compare("A") == 0 && cmd.length == 5) {
                let arg1Int: number = strToNumber(cmd.substr(1, 2));//P14 AD
                let arg2Int: number = strToNumber(cmd.substr(3, 2));//音量值
                let arg3Int: number = strToNumber(cmd.substr(5, 2));//电压值=值 * 25.78(mV)
                batVoltage = Math.round(arg3Int * 25.78);
            }
        }
        handleCmd = "";
    }

    function countChar(src: string, strFind: string): number {
        let cnt: number = 0;
        for (let i = 0; i < src.length; i++) {
            if (src.charAt(i).compare(strFind) == 0) {
                cnt++;
            }
        }
        return cnt;
    }

    function findIndexof(src: string, strFind: string, startIndex: number): number {
        for (let i = startIndex; i < src.length; i++) {
            if (src.charAt(i).compare(strFind) == 0) {
                return i;
            }
        }
        return -1;
    }

    function strToNumber(str: string): number {
        let num: number = 0;
        for (let i = 0; i < str.length; i++) {
            let tmp: number = converOneChar(str.charAt(i));
            if (tmp == -1)
                return -1;
            if (i > 0)
                num *= 16;
            num += tmp;
        }
        return num;
    }

    function converOneChar(str: string): number {
        if (str.compare("0") >= 0 && str.compare("9") <= 0) {
            return parseInt(str);
        }
        else if (str.compare("A") >= 0 && str.compare("F") <= 0) {
            if (str.compare("A") == 0) {
                return 10;
            }
            else if (str.compare("B") == 0) {
                return 11;
            }
            else if (str.compare("C") == 0) {
                return 12;
            }
            else if (str.compare("D") == 0) {
                return 13;
            }
            else if (str.compare("E") == 0) {
                return 14;
            }
            else if (str.compare("F") == 0) {
                return 15;
            }
            return -1;
        }
        else
            return -1;
    }

    /**
    * Set the angle of servo 1 to 8, range of 0~180 degree
    */
    //% weight=82 blockId=setServo block="Set servo|index %index|angle %angle|duration %duration"
    //% angle.min=0 angle.max=180
    //% subcategory=Control
    export function setServo(index: number, angle: number, duration: number) {
        if (angle > 180 || angle < 0) {
            return;
        }
        let position = mapRGB(angle, 0, 180, 500, 2500);

        let buf = pins.createBuffer(10);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x08;
        buf[3] = 0x03;//cmd type
        buf[4] = 0x01;
        buf[5] = duration & 0xff;
        buf[6] = (duration >> 8) & 0xff;
        buf[7] = index;
        buf[8] = position & 0xff;
        buf[9] = (position >> 8) & 0xff;
        serial.writeBuffer(buf);
    }

    /**
    *	Set the water pump on/off
    */
    //% weight=81 blockId=setWaterPump block="Set water pump speed(0~100) %speed"
    //% speed.min=0 speed.max=100
    //% subcategory=Control
    export function setWaterPump(speed: number) {
        if (waterpumPort == INVALID_PORT)
            return;
        if (speed > 100) {
            speed = 100;
        }
        let buf = pins.createBuffer(6);
        buf[0] = 0x55;
        buf[1] = 0x55;
        buf[2] = 0x04;
        buf[3] = 0x32;//cmd type
        if (waterpumPort == water_pumPort.M1) {
            buf[4] = speed;
            buf[5] = 0;
        }
        else if (waterpumPort == water_pumPort.M2) {
            buf[4] = 0;
            buf[5] = speed;
        }
        serial.writeBuffer(buf);
    }

    const FAN_DEFAULT_ADDR = 0x39;

    /**
    *	Set the water pump on/off
    */
    //% weight=80 blockId=setFanSpeed block="Set fan speed(0~100) %speed"
    //% speed.min=0 speed.max=100
    //% subcategory=Control
    export function setFanSpeed(speed: number) {
        if (fanPort == INVALID_PORT)
            return;
        if (speed > 100) {
            speed = 100;
        }
        i2cwrite(FAN_DEFAULT_ADDR, 0, speed);
    }

    function i2cwrite(adress: number, reg: number, value: number) {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        pins.i2cWriteBuffer(adress, buf);
    }

    function i2cread(adress: number, reg: number): number {
        pins.i2cWriteNumber(adress, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(adress, NumberFormat.UInt8BE);
        return val;
    }

    function WireWriteDataArray(addr: number, reg: number, val: string): boolean {
        let buf2 = pins.createBuffer(val.length + 1);
        buf2[0] = reg;
        for (let i = 0; i < val.length; i++) {
            buf2[i + 1] = val.charCodeAt(i);
        }
        let rvalue2 = pins.i2cWriteBuffer(addr, buf2);
        if (rvalue2 != 0) {
            return false;
        }
        return true;
    }

    //% weight=78 blockId=getUltrasonicDistance block="Get ultrasonic detected obstacle distance (cm)"
    //% subcategory=Sensor
    export function getUltrasonicDistance(): number {
        if (ultraPort == INVALID_PORT)
            return 0;
        let trigPin: DigitalPin = DigitalPin.P1;
        let echoPin: DigitalPin = DigitalPin.P2;
        let distance: number = 0;
        let d: number = 0;

        switch (ultraPort) {
            case ioPort.port1:
                trigPin = DigitalPin.P1;
                echoPin = DigitalPin.P2;
                break;
            case ioPort.port2:
                trigPin = DigitalPin.P13;
                echoPin = DigitalPin.P14;
                break;
        }
        pins.setPull(echoPin, PinPullMode.PullNone);
        pins.setPull(trigPin, PinPullMode.PullNone);

        // send pulse
        pins.digitalWritePin(trigPin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trigPin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trigPin, 0);
        // read pulse
        d = pins.pulseIn(echoPin, PulseValue.High, 15000);
        distance = d;
        // filter timeout spikes
        if (distance == 0 || distance >= 13920) {
            distance = distanceBak;
        }
        else
            distanceBak = d;
        return Math.round(distance * 10 / 6 / 58);
    }

    let ATH10_I2C_ADDR = 0x38;
    function temp_i2cwrite(value: number): number {
        let buf = pins.createBuffer(3);
        buf[0] = value >> 8;
        buf[1] = value & 0xff;
        buf[2] = 0;
        basic.pause(80);
        let rvalue = pins.i2cWriteBuffer(ATH10_I2C_ADDR, buf);
        // serial.writeString("writeback:");
        // serial.writeNumber(rvalue);
        // serial.writeLine("");
        return rvalue;
    }

    function temp_i2cread(bytes: number): Buffer {
        let val = pins.i2cReadBuffer(ATH10_I2C_ADDR, bytes);
        return val;
    }

    function GetInitStatus(): boolean {
        temp_i2cwrite(0xe108);
        let value = temp_i2cread(1);
        if ((value[0] & 0x68) == 0x08)
            return true;
        else
            return false;
    }

    function getAc() {
        temp_i2cwrite(0xac33);
        basic.pause(100)
        let value = temp_i2cread(1);
        for (let i = 0; i < 100; i++) {
            if ((value[0] & 0x80) != 0x80) {
                basic.pause(20)
            }
            else
                break;
        }
    }

    function readTempHumi(select: Temp_humi): number {
        while (!GetInitStatus()) {
            basic.pause(30);
        }
        getAc();
        let buf = temp_i2cread(6);
        if (buf.length != 6) {
            // serial.writeLine("444444")
            return 0;
        }
        let humiValue: number = 0;
        humiValue = (humiValue | buf[1]) << 8;
        humiValue = (humiValue | buf[2]) << 8;
        humiValue = humiValue | buf[3];
        humiValue = humiValue >> 4;
        let tempValue: number = 0;
        tempValue = (tempValue | buf[3]) << 8;
        tempValue = (tempValue | buf[4]) << 8;
        tempValue = tempValue | buf[5];
        tempValue = tempValue & 0xfffff;
        if (select == Temp_humi.Temperature) {
            tempValue = tempValue * 200 * 10 / 1024 / 1024 - 500;
            return Math.round(tempValue);
        }
        else {
            humiValue = humiValue * 1000 / 1024 / 1024;
            return Math.round(humiValue);
        }
    }

    /**
      * Get air temperature and humidity sensor value
      */
    //% weight=74 blockId="getTemperature" block="Get air %select value"
    //% subcategory=Sensor     
    export function getTemperature(select: Temp_humi): number {
        return readTempHumi(select);
    }

    let IIC_ADC = 0x46;
    /**
      * Get rainwater sensor value
      */
    //% weight=72 blockId="getRainWater" block="Get rainwater value"
    //% subcategory=Sensor     
    export function getRainWater(): number {
        if (rainwaterPort == INVALID_PORT)
            return 0;
        return i2cread(IIC_ADC, rainwaterPort);
    }

    /**
      * Get brightness sensor value
      */
    //% weight=70 blockId="getBrightness" block="Get brightness sensor value"
    //% subcategory=Sensor     
    export function getBrightness(): number {
        if (brightnessPort == INVALID_PORT)
            return 0;
        return 255 - i2cread(IIC_ADC, brightnessPort);
    }

    /**
      * Get soil moisture sensor value
      */
    //% weight=68 blockId="getSoilMoisture" block="Get soil moisture sensor value"
    //% subcategory=Sensor     
    export function getSoilMoisture(): number {
        if (soilPort == INVALID_PORT)
            return 0;
        return i2cread(IIC_ADC, soilPort);
    }


    /**
      * Get battery voltage value
      */
    //% weight=66 blockId="getBatteryVoltage" block="Get battery voltage (mV)"
    //% subcategory=Sensor     
    export function getBatteryVoltage(): number {
        return batVoltage;
    }


    /**
     * Initialize RGB
     */
    function initRGBLight() {
        if (!rgbLight) {
            if (rgbPort == ioPort.port1) {
                rgbLight = RGBLight.create(DigitalPin.P1, 2, RGBPixelMode.RGB);
            }
            else if (rgbPort == ioPort.port2) {
                rgbLight = RGBLight.create(DigitalPin.P13, 2, RGBPixelMode.RGB);
            }
        }
    }

    /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
    */
    //% blockId="setBrightness" block="set light brightness %brightness"
    //% weight=60
    //% subcategory=LED
    export function setBrightness(brightness: number): void {
        rgbLight.setBrightness(brightness);
    }

    /**
     * Set the color of the colored lights, after finished the setting please perform  the display of colored lights.
     */
    //% weight=58 blockId=setPixelRGB block="Set|%lightoffset|color to %rgb"
    //% subcategory=LED
    export function setPixelRGB(lightoffset: Lights, rgb: RGBColors) {
        rgbLight.setPixelColor(lightoffset, rgb);
    }
    /**
     * Set RGB Color argument
     */
    //% weight=56 blockId=setPixelRGBArgs block="Set|%lightoffset|color to %rgb"
    //% subcategory=LED
    export function setPixelRGBArgs(lightoffset: Lights, rgb: number) {
        rgbLight.setPixelColor(lightoffset, rgb);
    }

    /**
     * Display the colored lights, and set the color of the colored lights to match the use. After setting the color of the colored lights, the color of the lights must be displayed.
     */
    //% weight=54 blockId=showLight block="Show light"
    //% subcategory=LED
    export function showLight() {
        rgbLight.show();
    }

    /**
     * Clear the color of the colored lights and turn off the lights.
     */
    //% weight=52 blockGap=50 blockId=clearLight block="Clear light"
    //% subcategory=LED
    export function clearLight() {
        rgbLight.clear();
    }

    let WIFI_MODE_ADRESS = 0x69

    /*

    /**
       * set wifi module AP mode
       * @param ssid is a string, eg: "IoTHouse"
       * @param password is a string, eg: "123456"
      */
    //% weight=50 blockId=setWifiAPmodule block="Set wifi module to AP mode, wifi name %ssid and password %password"
    //% subcategory=Communication
    // export function setWifiAPmodule(ssid: string, password: string) {

    // }

    /**
     * set wifi module STA module
    */
    //% weight=48 blockId=setWifiSTAmodule block="Set wifi module to STA mode"
    //% subcategory=Communication
    // export function setWifiSTAmodule() {
    // }

    /**
     * set wifi module connect to router, only valid in STA mode
     * @param ssid is a string, eg: "iot"
     * @param password is a string, eg: "123456"
    */
    //% weight=46 blockId=setWifiConnectToRouter block="Set wifi module connect to router, wifi name %ssid and password %password, connect successfully?"
    //% subcategory=Communication
    //% blockGap=50    
    // export function setWifiConnectToRouter(ssid: string, password: string): boolean {
    //     return true;
    // }

    /**
     * Send the sensors data
     */
    //% weight=44 blockId=sendSensorData block="Send sensors data to wifi module"
    //% subcategory=Communication
    export function sendSensorData() {
        let cmdStr: string = "A";
        cmdStr += (tempHumiPort != INVALID_PORT ? getTemperature(Temp_humi.Temperature) : 'NO');
        cmdStr += '|';
        cmdStr += (tempHumiPort != INVALID_PORT ? getTemperature(Temp_humi.Humidity) : 'NO');
        cmdStr += '|';
        cmdStr += (soilPort != INVALID_PORT ? getSoilMoisture() : 'NO');
        cmdStr += '|';
        cmdStr += (brightnessPort != INVALID_PORT ? getBrightness() : 'NO');
        cmdStr += '|';
        cmdStr += (rainwaterPort != INVALID_PORT ? getRainWater() : 'NO');
        cmdStr += '$';
        let data = pins.createBuffer(cmdStr.length);
        for (let i = 0; i <= cmdStr.length - 1; i++) {
            data[i] = cmdStr.charCodeAt(i)
        }
        pins.i2cWriteBuffer(WIFI_MODE_ADRESS, data)
    }

    /**
    * get data from wifi
    */
    //% weight=42 blockId=getDatafromWifi block="Get data buffer from wifi module"
    //% subcategory=Communication
    export function getDatafromWifi(): Buffer {
        let received = pins.i2cReadBuffer(0x69, 3)
        return received;
    }

    /*
    function handleRecv(data: string) {
        if (data.length != 3) {
            return;
        }
        let cmd: string = data.substr(0, 1)
        let value: number = parseInt(data.substr(1, 1))
        switch (cmd) {
            case 'B':
                if (rgbLight) {//RGB模块控制
                    if (value)//开
                    {
                        setBrightness(200);
                        setPixelRGB(Lights.All, RGBColors.White);
                        showLight();
                    }
                    else {
                        clearLight();
                    }
                }
                break;
            case 'C'://水泵控制
                if (value)//开
                {
                    setWaterPump(100);
                }
                else {
                    setWaterPump(0);
                }
                break;
            case 'D'://风扇控制
                if (value)//开
                {
                    setFanSpeed(100);
                }
                else {
                    setFanSpeed(0);
                }
                break;
            case 'E'://蜂鸣器控制
                if (value)//开
                {
                    music.setVolume(200)
                    music.play(music.tonePlayable(698, music.beat(BeatFraction.Whole)), music.PlaybackMode.LoopingInBackground)
                }
                else {
                    music.stopAllSounds()
                }
                break;
            case 'F'://舵机1控制
                if (value)//开
                {
                    setServo(1, 180, 1000);
                }
                else {
                    setServo(1, 0, 1000);
                }
                break;
            case 'G'://舵机2控制
                if (value)//开
                {
                    setServo(4, 180, 1000);
                }
                else {
                    setServo(4, 0, 1000);
                }
                break;
        }
    }
    */

}
