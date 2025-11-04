// Warte auf DOM-Laden
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const brille = document.getElementById('brille');
    const weste = document.getElementById('weste');
    const regeln = document.getElementById('regeln');
    const storage = Telegram.WebApp.CloudStorage; // Für persistente Speicherung

    // Lade gespeicherte Zustände aus CloudStorage
    storage.getItems(['brille', 'weste', 'regeln'], (err, values) => {
        if (!err) {
            brille.checked = values.brille === 'true';
            weste.checked = values.weste === 'true';
            regeln.checked = values.regeln === 'true';
            checkAllCompleted(); // Prüfe direkt, ob schon alles abgehakt ist
        }
    });

    // Überwache Änderungen an Checkboxen und speichere sie
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            storage.setItem(checkbox.id, checkbox.checked.toString(), (err, saved) => {
                if (err) console.error('Speichern fehlgeschlagen:', err);
            });
            checkAllCompleted();
        });
    });

    function checkAllCompleted() {
        if (brille.checked && weste.checked && regeln.checked) {
            performBiometricVerification();
        }
    }

    function performBiometricVerification() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.biometricManager.init(() => {
                if (Telegram.WebApp.biometricManager.isBiometricAvailable && Telegram.WebApp.biometricManager.isAccessGranted) {
                    authenticate();
                } else if (!Telegram.WebApp.biometricManager.isAccessGranted) {
                    Telegram.WebApp.biometricManager.requestAccess({
                        reason: 'Für sicheren Check-in brauche ich Biometrie-Zugriff.'
                    }, (granted) => {
                        if (granted) {
                            authenticate();
                        } else {
                            fallbackAuth();
                        }
                    });
                } else {
                    fallbackAuth();
                }
            });
        } else {
            fallbackAuth();
        }
    }

    function authenticate() {
        Telegram.WebApp.biometricManager.authenticate({
            reason: 'Bestätige deine Identität für den Check-in.'
        }, (success, token) => {
            if (success) {
                alert('Verifizierung erfolgreich! App wird geschlossen.');
                closeApp();
            } else {
                alert('Verifizierung fehlgeschlagen. Versuche es erneut.');
            }
        });
    }

    function fallbackAuth() {
        Telegram.WebApp.showConfirm('Biometrie nicht verfügbar. Mit PIN oder Bestätigung fortfahren?', (confirmed) => {
            if (confirmed) {
                closeApp();
            } else {
                alert('Abgebrochen. Versuche es später.');
            }
        });
    }

    function closeApp() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.close();
        } else {
            // Fallback: Im Browser nichts tun oder simulieren
            window.location.href = 'about:blank';
        }
    }
});