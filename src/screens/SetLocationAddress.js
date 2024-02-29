import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Button, Modal, ScrollView, Image, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SetLocationAddress({ navigation, GlobalState }) {
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('');
    const saveAddress = () => {
        AsyncStorage.setItem('street', address.street);
        AsyncStorage.setItem('city', address.city);
        AsyncStorage.setItem('state', address.state);
        AsyncStorage.setItem('zip', address.zip);
        AsyncStorage.setItem('country', address.country);
        console.log(address);
        navigation.navigate('Home');
    };

    const address = {
        street,
        city,
        state,
        zip,
        country
    };

    return (
        <Modal>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <TextInput
                        style={styles.input}
                        placeholder="Street"
                        value={street}
                        onChangeText={setStreet}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="City"
                        value={city}
                        onChangeText={setCity}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="State"
                        value={state}
                        onChangeText={setState}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Zip"
                        value={zip}
                        onChangeText={setZip}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Country"
                        value={country}
                        onChangeText={setCountry}
                    />
                    <Button title="Save Address" onPress={saveAddress} />
                </View>
            </View>
        </Modal>
    );
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
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: 'tomato',
        width: '60%',
        alignSelf: 'center',
        marginTop: 10, // Ensure spacing between buttons
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: '80%',
    },
    pickupButton: {
        padding: 10,
        backgroundColor: 'blue',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    suggestionButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    suggestionButton: {
        backgroundColor: 'lightgrey',
        padding: 10,
        borderRadius: 5,
        margin: 5,
    },
    suggestionButtonText: {
        fontSize: 16,
        color: 'black',
    },
    billsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    billImageContainer: {
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    billImage: {
        width: 100,
        height: 50,
        resizeMode: 'contain',
    },
    billText: {
        marginTop: 5,
    }
})