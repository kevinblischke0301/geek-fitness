import {ChangeEvent, useState} from 'react'
import Logo from "../geek.png"
import "./App.css"

interface InformationNewSubnets {
    subnetMask: string,
    ipGateway: string,
    ipBroadcastDirection: string,
    ipFirstAvailableDirection: string,
    ipLastAvailableDirection: string
}


function App() {

    // Information needed to render automatically the website after any change with React
  const [ipAddress, setIpAddress] = useState("192.168.1.0");
  const [subnetMask, setSubnetMask] = useState("255.255.255.0");
  const [desiredSubnets, setDesiredSubnets] = useState("4");
  const [subnetsIpInformation, setSubnetsIpInformation] = useState<InformationNewSubnets[]>([]);

  // Functions needed to update the state of every input field and keep track on what is written
    const handleChangeIpAddress = (event: ChangeEvent<HTMLInputElement>) =>{
        setIpAddress(event.target.value)
    }

    const handleChangeSubnetMask = (event: ChangeEvent<HTMLInputElement>) => {
        setSubnetMask(event.target.value)
    }

    const handleChangeDesiredSubnets = (event: ChangeEvent<HTMLInputElement>) => {
        if (!isNaN(Number(event.target.value))){
            setDesiredSubnets(event.target.value)
        }
    }

    const handleShowIpAddress = () => {
        calculateSubnets()
    }

    function calculateSubnets(){

        // Helper Function
        function ipToBinary(ip: string){
            return ip.split(".").map(octet => parseInt(octet, 10).toString(2).padStart(8, "0")).join("")
        }
        // Helper Function
        function fromBinaryToDecimal(ipInBinary: string){
            const ipInOctets = new Array(4)

            // Puts each octet in the array
            for( let i = 0; i < ipInOctets.length; i++){
                ipInOctets[i] = parseInt(ipInBinary.slice(i * 8, (i + 1)*8), 2)

            }

            // Transforms the array into a string separating each octet with a point
            return ipInOctets.join(".")
        }

        function networkBinary(IP_ADDRESS: string, submaskBinary: string) {
            const ipInBinary = ipToBinary(IP_ADDRESS);
            return ipInBinary.split('').map((bit, index) => (bit === '1' && submaskBinary[index] === '1') ? "1" : "0").join("");
        }

        const subnetMaskBinary = ipToBinary(subnetMask)
        const subnetMaskCIDR = subnetMaskBinary.split("").filter(bit => bit === "1").length

        const neededBits = Math.ceil(Math.log2(parseInt(desiredSubnets)))
        const newSubMaskCIDR = subnetMaskCIDR + neededBits

        const newSubnetMaskInBinary = "1".repeat(newSubMaskCIDR) + "0".repeat(32 - newSubMaskCIDR)

        const newSubnetMaskInDecimal = fromBinaryToDecimal(newSubnetMaskInBinary)



        const networkIpInBinary = networkBinary(ipAddress, subnetMaskBinary)
        console.log(networkIpInBinary)
        const networkAddressWithoutHostBits = networkIpInBinary.slice(0, 32 - (32 - subnetMaskCIDR))

        // This functions create the needed extra bits between the network part and the host part of the IP
        function generateBinaryStrings(neededBits: number) {
            const binaryStrings = [];
            const maxNumber = Math.pow(2, neededBits);

            for (let i = 0; i < maxNumber; i++) {
                const binaryString = i.toString(2).padStart(neededBits, '0');
                binaryStrings.push(binaryString);
            }
            return binaryStrings;
        }

        const subnetsToPush = []

        // Creates the information through a loop for every single subnet and pushes it into subnetsToPush
        for (let i = 0; i < Number(desiredSubnets); i++){
            const ipGateway = fromBinaryToDecimal(networkAddressWithoutHostBits + generateBinaryStrings(neededBits)[i] + "0".repeat(32 - newSubMaskCIDR))
            const ipBroadcastDirection = fromBinaryToDecimal(networkAddressWithoutHostBits + generateBinaryStrings(neededBits)[i] + "1".repeat(32 - newSubMaskCIDR))
            const ipFirstAvailableDirection = fromBinaryToDecimal(networkAddressWithoutHostBits + generateBinaryStrings(neededBits)[i] + "0".repeat(32 - newSubMaskCIDR - 1) + "1")
            const ipLastAvailableDirection = fromBinaryToDecimal(networkAddressWithoutHostBits + generateBinaryStrings(neededBits)[i] + "1".repeat(32 - newSubMaskCIDR - 1) + "0")

            subnetsToPush.push({
                ipGateway,
                ipBroadcastDirection,
                subnetMask: newSubnetMaskInDecimal,
                ipFirstAvailableDirection,
                ipLastAvailableDirection
            })
        }
        setSubnetsIpInformation(subnetsToPush)

    }

    // Renders the information in a card when called
  const renderIpInformation = () => {
        return subnetsIpInformation.slice(-desiredSubnets, subnetsIpInformation.length).map((ipInformation, index) => {
            return <div className="subnet-card" key={index}>
                <h2>Subnet {index + 1}</h2>
                <p><strong>IPs Gateway:</strong> {ipInformation.ipGateway}</p>
                <p><strong>IPs First Available Direction:</strong> {ipInformation.ipFirstAvailableDirection}</p>
                <p><strong>IPs Last Available Direction:</strong> {ipInformation.ipLastAvailableDirection}</p>
                <p><strong>IPs Broadcast Direction:</strong> {ipInformation.ipBroadcastDirection}</p>
                <p><strong>IPs Subnet Mask:</strong> {ipInformation.subnetMask}</p>
            </div>
        })
  }

    // Renders the whole application
    return (
        <div className="main-container">
            <img className="img-logo" alt="logo" src={Logo}/>

            <div className="app-container">
                <div className="input-container">
                    <h1>IP Address Calculator</h1>
                    <label>
                        IP Address:
                        <input type="text" onChange={handleChangeIpAddress} value={ipAddress}/>
                    </label>
                    <label>
                        Subnet Mask:
                        <input type="text" onChange={handleChangeSubnetMask} value={subnetMask}/>
                    </label>
                    <label>
                        Desired Subnets:
                        <input type="number" min={2} onChange={handleChangeDesiredSubnets} value={desiredSubnets}/>
                    </label>
                    <button onClick={handleShowIpAddress}>Calculate Subnets</button>
                </div>
                <div className="subnets-container">
                    {renderIpInformation()}
                </div>
            </div>
        </div>

    )
}

export default App



