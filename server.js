const express = require('express');
const { SerialPort } = require('serialport')

const app = express();
app.use(express.json());

let port;

const initSerialPort = async () => {
    port = new SerialPort({ path: 'COM3', baudRate: 9600 }, (err) => {
        if (err) {
            console.log('Error abriendo puerto: ' + err.message);
            return;
        }
        console.log('Puerto serial abierto');
    })
}

const writePackets = async (data) => {
    return new Promise((resolve, reject) => {
        port.write(data, (err) => {
            console.log(data);
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

const closeSerialPort = () => {
    if (port && port.isOpen) {
        port.close((err) => {
            if (err) {
                console.log('Error cerrando puerto serial: ' + err.message);
                return;
            }
            console.log('Puerto serial cerrado.');
        });
    }
}

app.post('/print', async (req, res) => {

    const packets = req.body.data;

    if (!Array.isArray(packets)) {
        return res.send({ ok: false, response: 'Data debe ser un array' });
    }

    try {
        await Promise.all(packets.map(packet => writePackets(packet)));
        res.send({ ok: true, response: 'Impresión correcta' });
    } catch (error) {
        console.log('Error escribiendo paquetes: ' + error.message);
        res.send({ ok: false, response: error.message });
    }

});

const serverPort = 5000;
app.listen(serverPort, async () => {
    await initSerialPort();
    console.log(`Server listening on port ${serverPort}`);
});

// Cierre del puerto al detener el servidor
process.on('SIGINT', () => {
    console.log('Bajando servidor');
    closeSerialPort();
    process.exit();
});