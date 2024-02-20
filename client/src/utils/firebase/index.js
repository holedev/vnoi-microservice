import {
    onDisconnect,
    onValue,
    push,
    ref,
    remove,
    serverTimestamp,
    set,
} from "firebase/database";
import { realtimeDB } from "~/configs/firebase";

function handleUserOnlineFirebase(_id, fullName, avatar, role) {
    const connectedRef = ref(realtimeDB, ".info/connected");

    const myConnectionsRef = ref(realtimeDB, `users/${_id}/connections`);
    const infoUserRef = ref(realtimeDB, `users/${_id}/info`);
    const lastOnlineRef = ref(realtimeDB, `users/${_id}/lastOnline`);

    set(infoUserRef, {
        fullName,
        avatar,
        role,
    });

    onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            const con = push(myConnectionsRef);
            localStorage.setItem("dataKey", JSON.stringify(con.key));
            onDisconnect(con).remove();
            set(con, true);
            onDisconnect(lastOnlineRef).set(serverTimestamp());
        }
    });
}

function handleUserOfflineFirebase(_id, keyToDelete) {
    const myConnectionRef = ref(
        realtimeDB,
        `users/${_id}/connections/${keyToDelete}`
    );
    const lastOnlineRef = ref(realtimeDB, `users/${_id}/lastOnline`);

    remove(myConnectionRef);
    set(lastOnlineRef, serverTimestamp());
}

export { handleUserOnlineFirebase, handleUserOfflineFirebase };
