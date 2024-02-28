import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { randomBytes, Mnemonic, Wallet, JsonRpcProvider, formatUnits } from 'ethers';
import * as ethers from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Events from "@pioneer-platform/pioneer-events";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

// let spec = "https://cash2btc.com/spec/swagger.json"
let spec = "https://cash2btc.com/api/v1"
let PIONEER_WS = 'wss://cash2btc.com'
let USDT_CONTRACT_POLYGON = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
const service = "https://polygon.rpc.blxrbdn.com"

export default function Home({ navigation, GlobalState}) {
    const { } = GlobalState;
    const [mnemonic, setMnemonic] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState(null);
    const [cashDisplay, setCashDisplay] = useState('');
    const [cryptoDisplay, setCryptoDisplay] = useState('');
    const [currentRate, setCurrentRate] = useState(1);


    let getBalance = async function(){
        try{
            console.log("getBalance: ")



        }catch(e){
            console.error(e)
        }
    }

    let onStart = async function(){
        try{

            let QUERY_KEY = await AsyncStorage.getItem('QUERY_KEY');
            if(!QUERY_KEY){
                QUERY_KEY = uuidv4()
                AsyncStorage.setItem('QUERY_KEY');
            }
            const apiClient = axios.create({
                baseURL: spec, // Your base URL
                headers: {
                    'Authorization':  QUERY_KEY// Replace 'YOUR_AUTH_TOKEN' with your actual token
                }
            });
            console.log("onStart")
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });

            //
            let storedMnemonic = await AsyncStorage.getItem('mnemonic');
            if(storedMnemonic){
                setMnemonic(storedMnemonic);
            } else {
                const randomEntropyBytes = ethers.randomBytes(16); // 128-bit entropy
                console.log("randomEntropyBytes: ", randomEntropyBytes);
                // console.log("newMnemonic: ", Mnemonic.fromEntropy(randomEntropyBytes))
                let newMnemonic = Mnemonic.fromEntropy(randomEntropyBytes);
                AsyncStorage.setItem('mnemonic', newMnemonic.phrase);
                storedMnemonic = newMnemonic.phrase
                setMnemonic(storedMnemonic)
            }
            // Create wallet from the mnemonic
            // console.log("ethers: ", ethers);
            const wallet = Wallet.fromPhrase(storedMnemonic);
            console.log("Wallet address: ", wallet.address);
            setAddress(wallet.address);

            //get balance
            // The ABI for the methods we want to interact with
            const minABI = [
                // balanceOf
                {
                    "constant":true,
                    "inputs":[{"name":"_owner","type":"address"}],
                    "name":"balanceOf",
                    "outputs":[{"name":"balance","type":"uint256"}],
                    "type":"function"
                },
                // decimals
                {
                    "constant":true,
                    "inputs":[],
                    "name":"decimals",
                    "outputs":[{"name":"","type":"uint8"}],
                    "type":"function"
                }
            ];
            // Assuming a provider is set up (e.g., ethers.getDefaultProvider or other)
            const provider = new JsonRpcProvider(service);

            // Create a new instance of a Contract
            const newContract = new ethers.Contract(USDT_CONTRACT_POLYGON, minABI, provider);

            // Now using ethers to call contract methods
            const decimals = await newContract.decimals();
            const balanceBN = await newContract.balanceOf(wallet.address);

            // Since ethers.js returns BigNumber, you need to format it considering the token's decimals
            // Use the formatUnits utility function to convert the balance to a human-readable format
            const tokenBalance = formatUnits(balanceBN, decimals);

            // Convert balanceBN from a BigNumber to a number, considering the decimals
            // const tokenBalance = balanceBN.div(ethers.BigNumber.from(10).pow(decimals)).toNumber();
            console.log("tokenBalance: ", tokenBalance);
            setCryptoDisplay(tokenBalance);

            //cash balance
            let cashBalance = await AsyncStorage.getItem('cash');
            console.log("cashBalance: ", cashBalance);
            setCashDisplay(cashBalance);

            let rate
            let TOTAL_CASH = Number(cashBalance);
            let TOTAL_DAI = Number(tokenBalance);
            if(TOTAL_CASH == 0 || TOTAL_DAI == 0){
                rate = 1;
            } else {
                rate = (TOTAL_DAI / TOTAL_CASH);
                setCurrentRate(rate.toFixed(2));
            }
            console.log("rate: ", rate);

            let GLOBAL_SESSION = new Date().getTime()
            //@SEAN MAKE THIS ADJUSTABLE
            let TERMINAL_NAME = "JoosePhone"
            let config = {
                queryKey:QUERY_KEY,
                username:"app-mm-tester-battle",
                wss:PIONEER_WS
            }

            //get server info
            const statusLocal = await axios.get(
                spec+ "/bankless/info"
            );
            console.log("statusLocal: ", statusLocal.data);

            //get terminal info
            let terminalInfo = await apiClient.get(spec+ "/bankless/terminal/private/"+TERMINAL_NAME);
            console.log("terminalInfo: ", terminalInfo.data);

            if(!terminalInfo.data.terminalInfo){
                //register
                let terminal = {
                    terminalId:TERMINAL_NAME+":"+wallet.address,
                    terminalName:TERMINAL_NAME,
                    tradePair: "USDT_USD",
                    rate,
                    captable:[],
                    sessionId: GLOBAL_SESSION,
                    TOTAL_CASH:TOTAL_CASH.toString(),
                    TOTAL_DAI:TOTAL_DAI.toString(),
                    pubkey:wallet.address,
                    fact:"",
                    location:[location.coords.latitude, location.coords.longitude] //@SEAN get real location
                }
                //clear session
                console.log("REGISTERING TERMINAL: ",terminal)
                let respRegister = await apiClient.post(
                    spec+"/bankless/terminal/submit",
                    terminal
                );
                console.log("respRegister: ",respRegister.data)
            } else {
                //update
                let update = {
                    sessionId: GLOBAL_SESSION,
                    terminalName:TERMINAL_NAME,
                    pubkey:wallet.address,
                    rate,
                    TOTAL_CASH:TOTAL_CASH.toString(),
                    TOTAL_DAI:TOTAL_DAI.toString(),
                    captable:[],
                    location:[location.coords.latitude, location.coords.longitude]
                }
                let respRegister = await apiClient.post(
                    spec+"/bankless/terminal/update",
                    update
                );
                console.log("respRegister: ",respRegister.data)
            }

            //sub ALL events
            console.log("config: ",config)
            let clientEvents = new Events.Events(config)
            clientEvents.init()
            clientEvents.setUsername(config.username)

            //sub to events
            clientEvents.events.on('message', async (event) => {
                try{
                    log.info(tag,"event: ",event)
                    //is online
                    //TODO push location

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

        }catch(e){
            console.error(e)
        }
    }

    useEffect(() => {
        onStart()
    }, []);

/*    useEffect(() => {
       setToDoList(prevState => [...prevState, { id: 2, task: 'go to bed' }])
   }, [])
    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.task}
                onPress={() => handleChooseTask(item)}
            >
                <Text>{item.task}</Text>
            </TouchableOpacity>
        )
    }

    const handleSaveTask = () => {
        const index = toDoList.length + 1;

        setToDoList(prevState => [...prevState, { id: index, task: task }]);

        setTask('');
    }

    const handleChooseTask = (item) => {
        setChosenTask(item);
        navigation.navigate('ChosenTask');
    }*/

    const goToLiquidityPage = () => {
        navigation.navigate('Liquidity');
    }
    const updateBalances = async () => {
        let storedMnemonic = await AsyncStorage.getItem('mnemonic');
        const wallet = Wallet.fromPhrase(storedMnemonic);
        console.log("Wallet address: ", wallet.address);
        setAddress(wallet.address);

        //get balance
        // The ABI for the methods we want to interact with
        const minABI = [
            // balanceOf
            {
                "constant":true,
                "inputs":[{"name":"_owner","type":"address"}],
                "name":"balanceOf",
                "outputs":[{"name":"balance","type":"uint256"}],
                "type":"function"
            },
            // decimals
            {
                "constant":true,
                "inputs":[],
                "name":"decimals",
                "outputs":[{"name":"","type":"uint8"}],
                "type":"function"
            }
        ];
        // Assuming a provider is set up (e.g., ethers.getDefaultProvider or other)
        const provider = new JsonRpcProvider(service);

        // Create a new instance of a Contract
        const newContract = new ethers.Contract(USDT_CONTRACT_POLYGON, minABI, provider);

        // Now using ethers to call contract methods
        const decimals = await newContract.decimals();
        const balanceBN = await newContract.balanceOf(wallet.address);

        // Since ethers.js returns BigNumber, you need to format it considering the token's decimals
        // Use the formatUnits utility function to convert the balance to a human-readable format
        const tokenBalance = formatUnits(balanceBN, decimals);

        // Convert balanceBN from a BigNumber to a number, considering the decimals
        // const tokenBalance = balanceBN.div(ethers.BigNumber.from(10).pow(decimals)).toNumber();
        console.log("tokenBalance: ", tokenBalance);
        setCryptoDisplay(tokenBalance);
        let cashBalance = await AsyncStorage.getItem('cash');
        console.log(cashBalance);
        setCashDisplay(cashBalance);

        //set rate
        let rate
        let TOTAL_CASH = Number(cashBalance);
        let TOTAL_USDT = Number(tokenBalance);
        if(TOTAL_CASH == 0 || TOTAL_USDT == 0){
            rate = 1;
        } else {
            rate = (TOTAL_USDT / TOTAL_CASH);
            setCurrentRate(rate.toFixed(2));
        }
        return (TOTAL_USDT, TOTAL_CASH, rate);
    }

    return (
        <View style={styles.screen}>
            <Header />
            <View style={styles.body}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => goToLiquidityPage()}
                >
                    <Text style={styles.buttonText} >Set Cash Reserve</Text>
                </TouchableOpacity>
                <Text style={styles.rateLabel}>Rate: {currentRate} USDT/USD</Text>
                <View style={styles.container}>
                    <View style={[styles.balanceContainer, styles.balanceContainerWithMargin]}>
                        <Text style={styles.balanceLabel}>Crypto:</Text>
                        <Text style={styles.balanceValue}>${cryptoDisplay}</Text>
                    </View>
                    <View style={[styles.balanceContainer, styles.balanceContainerWithMargin]}>
                        <Text style={styles.balanceLabel}>Cash:</Text>
                        <Text style={styles.balanceValue}>${cashDisplay}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => updateBalances()}
                >
                    <Text style={styles.buttonText} >Update Balances</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.body}>
                <MapView style={styles.map} initialRegion={location}>
                    {location && <Marker coordinate={location} title="You are here" description="Your location" />}
                </MapView>
            </View>
            <Footer navigation={navigation} />
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    body: {
        flex: 8,
        width: '100%',
        backgroundColor: '#14141410',
        alignItems: 'center'
    },
    task: {
        backgroundColor: 'white',
        padding: 10,
        margin: 10,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#1ccb1b',
        padding: 15,
        paddingTop: 10,
        paddingBottom: 10,
        margin: 10,
        marginBottom: 30,
        borderRadius: 12,
        shadowColor: "#29d522",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        fontWeight: '900'
    },
    map: {
        width: '100%',
        height: '100%',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    balanceContainer: {
        alignItems: 'center',
    },
    balanceContainerWithMargin: {
        marginHorizontal: 20,
    },
    balanceLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    rateLabel: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5
    },
    balanceValue: {
        fontSize: 16,
    }
})
