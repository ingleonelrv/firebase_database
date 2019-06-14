import React from "react";
import { AsyncStorage } from "react-native";
import { StyleSheet, TextInput, Alert, Text, View, Button } from "react-native";

import firebase from "react-native-firebase";
let database;
export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      fname: "",
      lname: "",
      age: "",
      users: []
    };
  }

  async componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners();
    this.initializeDB();
  }
  //##############NOTIFICATIONS
  //1
  checkPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  };
  //3
  getToken = async () => {
    let fcmToken = await AsyncStorage.getItem("fcmToken");
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem("fcmToken", fcmToken);
      }
    }
  };

  //2
  requestPermission = async () => {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log("permission rejected");
    }
  };
  //Remove listeners allocated in createNotificationListeners()
  componentWillUnmount = () => {
    this.notificationListener();
    this.notificationOpenedListener();
  };

  createNotificationListeners = async () => {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const { title, body } = notification;
        this.showAlert(title, body);
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        debugger;
        // const { title, body } = notificationOpen.notification;
        // this.showAlert(title, body);
        alert("Going to search screen for example");
      });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      debugger;
      // const { title, body } = notificationOpen.notification;
      // this.showAlert(title, body);
      alert("Going to search screen for example");
    }
    /*
     * Triggered for data only payload in foreground
     * */
    this.messageListener = firebase.messaging().onMessage(message => {
      //process data message
      console.log(JSON.stringify(message));
    });
  };

  showAlert(title, body) {
    Alert.alert(
      title,
      body,
      [{ text: "OK", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  }
  //########FIREBASE DATABASE
  initializeDB = () => {
    database = firebase.database();
  };
  handleSave = () => {
    let dataRef = database.ref("users/");
    let dataPush = dataRef.push(this.state);
    this.setState({ fname: "", lname: "", age: "" });
  };
  handleRead = async () => {
    let dataRef = database.ref("users/");
    //update working
    // dataRef.child("-LhHR3VNwHkQFSfkC699").update({ age: 24 });
    //To can read without auth() enable from firebase console Auth Anonym
    dataRef.on("value", snapshot => {
      let users = [];
      snapshot.forEach(key => {
        let user = {
          id: key.key,
          user: key._value
        };
        users.push(user);
      });
      this.setState({ users });
    });
  };
  render() {
    return (
      <View style={styles.container}>
        <TextInput
          placeholder="First Name"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={fname => this.setState({ fname })}
          value={this.state.fname}
        />
        <TextInput
          placeholder="Last Name"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={lname => this.setState({ lname })}
          value={this.state.lname}
        />
        <TextInput
          placeholder="Age"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={age => this.setState({ age })}
          value={this.state.age}
        />
        <Button style={styles.btn} title="Save" onPress={this.handleSave} />
        <Button style={styles.btn} title="Read" onPress={this.handleRead} />
        {this.state.users &&
          this.state.users.map(user => {
            return (
              <View style={styles.userList} key={user.id}>
                <Text>First Name: {user.user.fname}</Text>
                <Text>Last Name: {user.user.lname}</Text>
                <Text>Age: {user.user.age}</Text>
              </View>
            );
          })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  btn: {
    marginVertical: 15
  },
  textInput: {
    height: 40,
    width: "90%",
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 8
  },
  userList: {
    flex: 0,
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,.1)"
  }
});
