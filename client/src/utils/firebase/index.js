import {
  onChildAdded,
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
} from 'firebase/database';
import { realtimeDB } from '~/configs/firebase';

function handleUserOnlineFirebase(_id, fullName, avatar, role) {
  const connectedRef = ref(realtimeDB, '.info/connected');

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
      localStorage.setItem('dataKey', JSON.stringify(con.key));
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

function checkProblemsQueue(handleProblemStatus) {
  const problemsSuccessRef = ref(realtimeDB, 'problems/success');
  const problemsErrorRef = ref(realtimeDB, 'problems/error');

  onChildAdded(problemsSuccessRef, (snap) => {
    handleProblemStatus({
      status: 'success',
      uuid: snap.val().uuid,
    });

    removeProblemStatus(snap.val().uuid, 'success');
  });

  onChildAdded(problemsErrorRef, (snap) => {
    handleProblemStatus({
      status: 'error',
      uuid: snap.val().uuid,
    });

    removeProblemStatus(snap.val().uuid, 'error');
  });
}

function removeProblemStatus(uuid, status) {
  const problemRef = ref(realtimeDB, `problems/${status}/${uuid}`);
  remove(problemRef);
}

function checkRunConsolesQueue(handleRunConsoleStatus) {
  const consolessResultRef = ref(realtimeDB, 'consoles/results');

  onChildAdded(consolessResultRef, (snap) => {
    handleRunConsoleStatus({
      uuid: snap.val().uuid,
      message: snap.val().message,
    });

    removeRunConsoleStatus(snap.val().uuid);
  });
}

function removeRunConsoleStatus(uuid) {
  const consolesRef = ref(realtimeDB, `consoles/results/${uuid}`);
  remove(consolesRef);
}

function checkSubmissionsQueue(handleRunConsoleStatus) {
  const consolessResultRef = ref(realtimeDB, 'submissions/results');

  onChildAdded(consolessResultRef, (snap) => {
    handleRunConsoleStatus({
      uuid: snap.val().uuid,
      message: snap.val().message,
    });

    removeSubmissionStatus(snap.val().uuid);
  });
}

function removeSubmissionStatus(uuid) {
  const consolesRef = ref(realtimeDB, `submissions/results/${uuid}`);
  remove(consolesRef);
}

export {
  handleUserOnlineFirebase,
  handleUserOfflineFirebase,
  checkProblemsQueue,
  removeProblemStatus,
  checkRunConsolesQueue,
  removeRunConsoleStatus,
  checkSubmissionsQueue,
  removeSubmissionStatus,
};
