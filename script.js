// Warte auf DOM-Laden
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const brille = document.getElementById('brille');
    const weste = document.getElementById('weste');
    const regeln = document.getElementById('regeln');

    // Überwache Änderungen an Checkboxen
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', checkAllCompleted);
    });

    function checkAllCompleted() {
        if (brille.checked && weste.checked && regeln.checked) {
            performBiometricVerification();
        }
    }

    function performBiometricVerification() {
        if (window.Telegram && Telegram.WebApp) {
            // Initialisiere Biometric Manager (falls nicht schon)
            Telegram.WebApp.biometricManager.init(() => {
                // Fordere Zugriff an, falls nicht gewährt
                if (!Telegram.WebApp.biometricManager.isAccessGranted) {
                    Telegram.WebApp.biometricManager.requestAccess({
                        reason: 'Zur Verifizierung für den Sicherheits-Check-in.'
                    }, (granted) => {
                        if (granted) {
                            authenticate();
                        } else {
                            alert('Biometrie-Zugriff verweigert. App kann nicht fortfahren.');
                        }
                    });
                } else {
                    authenticate();
                }
            });
        } else {
            // Fallback für nicht-Telegram-Umgebung
            if (confirm('Biometrische Verifizierung simulieren? (In echtem Browser nicht möglich)')) {
                closeApp();
            }
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

    function closeApp() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.close();
        } else {
            // Fallback: Im Browser nichts tun oder simulieren
            window.location.href = 'about:blank'; // Oder einfach alert
        }
    }
});