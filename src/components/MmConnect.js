/*
    Create market maker account
    register

    go online

 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StyleSheet, Text, View} from "react-native";
import Constants from "expo-constants";
require("dotenv").config()
require("dotenv").config({path:'../.env'})
const Bankless = require("@pioneer-platform/pioneer-client").default;
// let signer = require("eth-token-wallet")
let signer = require("eth_mnemonic_signer")
const log = require('@pioneer-platform/loggerdog')();
let Events = require("@pioneer-platform/pioneer-events")
// import { TokenWallet } from 'eth-token-wallet'
let seed = process.env['WALLET_MARKET_MAKER']
console.log("seed: ",seed)
if(!seed) throw Error("invalid ENV:  WALLET_MARKET_MAKER required")
let GLOBAL_SESSION = "unset"
// let spec = "http://127.0.0.1:4000/spec/swagger.json"
//let spec = "http://127.0.0.1:9001/spec/swagger.json"
let PIONEER_WS = 'ws://127.0.0.1:9001'

// Define an async function to run the test
export const MmConnect = async () => {
    let tag = " | test | "
    try {
        let seed = await AsyncStorage.getItem('mnemonic');
        console.log("seed: ",seed)

        let index = 1
        let path = "m/44'/60'/"+index+"'/0/0"
        let address = await signer.getAddress(seed,path)
        address = address.toLowerCase()
        console.log("address: ",address)

        let TERMINAL_NAME = "jooseMM"
        let QUERY_KEY = "testKeyJoose"

        //build register payload
        let callHeader = {
            headers: {
                Authorization: QUERY_KEY
            }
        }

        //get all functions
        let resultHealth = await axios.get('https://cash2btc.com/api/v1/bankless/health', callHeader)

        console.log("result: ",resultHealth.data)

        //register
        let terminalInfo = await axios.get('https://cash2btc.com/api/v1/bankless/terminal/private/', callHeader, ({terminalName:TERMINAL_NAME}))
        console.log("terminalInfo: ",terminalInfo)

        let cash = Number(AsyncStorage.getItem(''));
        let crypto = Number(AsyncStorage.getItem('mnemonic'));

        let rate
        let TOTAL_CASH = 100
        let TOTAL_DAI = 100
        if(TOTAL_CASH == 0 || TOTAL_DAI == 0){
            rate = "1"
        } else {
            rate = (TOTAL_CASH / TOTAL_DAI)
        }
        log.info(tag,"rate: ",rate)

        //
        let terminal = {
            terminalId:TERMINAL_NAME+":"+await signer.getAddress(seed),
            terminalName:TERMINAL_NAME,
            tradePair: "USD_DAI",
            rate,
            captable:[],
            sessionId: GLOBAL_SESSION,
            TOTAL_CASH:TOTAL_CASH.toString(),
            TOTAL_DAI:TOTAL_DAI.toString(),
            pubkey:await signer.getAddress(seed),
            fact:"",
            location:[ 4.5981, -74.0758 ]
        }
        console.log("terminal: ",terminal)
        let resultSubmit = await bankless.SubmitTerminal(terminal)
        log.info(tag,"resultSubmit: ",resultSubmit)

        //go online
        //sub ALL events
        let clientEvents = new Events.Events(config)
        clientEvents.init()
        clientEvents.setUsername(config.username)

        //sub to events
        clientEvents.events.on('message', async (event) => {
            let tag = TAG + " | events | "
            try{

                //is online

                //if match
                if(event.payload && event.payload.type == "match"){
                    //handle match
                    log.info(tag,"event: ",event)
                }


                //LP stuff
                if(event.payload && (event.payload.type == "lpAdd" || event.payload.type == "lpAddAsym")){
                    log.info(tag,"event: ",event)
                }
                if(event.payload && (event.payload.type == "lpWithdrawAsym" || event.payload.type == "lpWithdraw")){
                    log.info(tag,"event: ",event)
                }

            }catch(e){
                log.error(e)
            }
        })
        //on match
        return (
            <View style={styles.header}>
                <Text style={styles.text}>NoBank Market-Maker</Text>
            </View>
        )
    } catch (e) {
        console.error(e);
    }
};

const styles = StyleSheet.create({
    header: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingTop: Constants.statusBarHeight,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
        zIndex: 5
    },
    text: {
        fontSize: 18,
        fontWeight: '900',
        color: '#141414'
    }
})