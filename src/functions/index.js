const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendShiftEmail = functions.firestore
  .document("shifts/{shiftId}")
  .onCreate(async (snap, context) => {
    const shift = snap.data();
    const emp = await admin
      .firestore()
      .doc(`employees/${shift.employeeId}`)
      .get();

    const email = emp.data().email;

    await admin
      .firestore()
      .collection("mail")
      .add({
        to: email,
        message: {
          subject: "Ваша смена",
          text: `Новая смена: ${shift.date} ${shift.start}-${shift.end}`,
        },
      });

    return true;
  });
