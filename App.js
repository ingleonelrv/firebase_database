import React from "react";
import { StyleSheet, TextInput, Image, Text, View, Button } from "react-native";

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
    this.initializeDB();
  }
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
