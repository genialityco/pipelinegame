import { FBAuth, FBRealTime } from "./firebase/ConfigFirebase";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  ref,
  set,
  get,
  serverTimestamp,
  onValue,
  query,
  orderByChild,
  endBefore,
} from "firebase/database";

export default function presencefirebase(globalgetter, globalsetter) {
  return new Promise((resolve, reject) => {
    let positioncontedor = document.getElementById("position");

    const onReset = () => {
      const ballRef = ref(FBRealTime, "/ballposition");
      set(ballRef, 0);
    };
    const isWin = (cantidadJugadores) => {
      const ballRef = ref(FBRealTime, "/ballposition");
      onValue(ballRef, (snapshot) => {
        const posicionbola = snapshot.val() || 0;

       
        let pTextGanar = document.getElementById("pTextGanar");
        if ((posicionbola + 1) > cantidadJugadores) {
          pTextGanar.style.display = "block";
        }else {
          pTextGanar.style.display = "none";
        }
      });
    };

    onValue(ref(FBRealTime, ".info/connected"), function (snapshot) {
      console.log("snashop .info/connected", snapshot.val());
    });

    signInAnonymously(FBAuth)
      .then(() => {
        //me loguie
        var uid = FBAuth.currentUser.uid;
        console.log("uid", uid);

        // Create a reference to this user's specific status node.
        // This is where we will store data about being online/offline.
        var userStatusDatabaseRef = ref(FBRealTime, "/status/" + uid);
        // We'll create two constants which we will write to
        // the Realtime database when this device is offline
        // or online.
        var isOfflineForDatabase = {
          state: "offline",
          last_changed: serverTimestamp(FBRealTime),
        };

        var isOnlineForDatabase = {
          state: "online",
          last_changed: serverTimestamp(FBRealTime),
        };

        console.log("demonios", isOnlineForDatabase.last_changed);

        set(userStatusDatabaseRef, isOnlineForDatabase).then(() => {
          get(userStatusDatabaseRef).then((snap) => {
            console.log("snap", snap, snap.val());
            const totalConnectedRef = query(
              ref(FBRealTime, "/status"),
              orderByChild("last_changed"),
              endBefore(snap.val().last_changed)
            );
            const cantJugadores = query(ref(FBRealTime, "/status"));

            onValue(cantJugadores, (snapshot) => {
              console.log('Evaluando',snapshot.size)
              isWin(snapshot.size);
            });

            console.log("porque tantos");
            onValue(totalConnectedRef, (snapshot) => {
              console.log("cuantos", snapshot.size);
              positioncontedor.innerHTML = snapshot.size;
              let btnReiniciar = document.getElementById("btnReiniciar");
              if (snapshot.size === 0) {
                btnReiniciar.style.display = "inline";
                btnReiniciar.addEventListener("click", onReset);
              } else {
                btnReiniciar.style.display = "none";
              }

              globalsetter({ myposition: snapshot.size });
              let global = globalgetter();

              console.log(
                "IIglobalposition",
                global.scene,
                global.ball,
                global.ballposition,
                global.myposition
              );
              if (global.scene && global.ball) {
                if (
                  global.myposition == global.ballposition ||
                  global.testmode
                ) {
                  global.scene.add(global.ball);
                } else {
                  global.scene.remove(global.ball);
                }
              }

              resolve(snapshot.size);
            });
          });
        });

        //})
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("error", error);
        reject(error);
      });
  });

  // Create a reference to the special '.info/connected' path in
  // Realtime Database. This path returns `true` when connected
  // and `false` when disconnected.
  // firebase.database().ref('.info/connected').on('value', function(snapshot) {
  //     // If we're not currently connected, don't do anything.
  //     if (snapshot.val() == false) {
  //         return;
  //     };

  //     // If we are currently connected, then use the 'onDisconnect()'
  //     // method to add a set which will only trigger once this
  //     // client has disconnected by closing the app,
  //     // losing internet, or any other means.
  //     userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
  //         // The promise returned from .onDisconnect().set() will
  //         // resolve as soon as the server acknowledges the onDisconnect()
  //         // request, NOT once we've actually disconnected:
  //         // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

  //         // We can now safely set ourselves as 'online' knowing that the
  //         // server will mark us as offline once we lose connection.
  //         userStatusDatabaseRef.set(isOnlineForDatabase);
  //     });
  // });
}
