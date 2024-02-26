import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { randomBytes, Mnemonic, Wallet } from 'ethers';
import * as ethers from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home({ navigation, GlobalState }) {
    const { } = GlobalState;
    const [mnemonic, setMnemonic] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState(null);

    let onStart = async function(){
        try{
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
            console.log("ethers: ", ethers);
            const wallet = Wallet.fromPhrase(storedMnemonic);
            console.log("Wallet address: ", wallet.address);
            setAddress(wallet.address);
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

    return (
        <View style={styles.screen}>
            <Header />
            <View style={styles.body}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => goToLiquidityPage()}
                >
                    <Text style={styles.buttonText} >Generate Wallet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => goToLiquidityPage()}
                >
                    <Text style={styles.buttonText} >Set Liquidity</Text>
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
        backgroundColor: '#14141410'
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
        height: '80%',
    }
})
