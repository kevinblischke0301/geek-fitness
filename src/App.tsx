import {ChangeEvent, useEffect, useState} from 'react'
import "./App.css"
interface InformationNewSubnets {
    subnetMask: string,
    ipGateway: string,
    ipBroadcastDirection: string,
    ipFirstAvailableDirection: string,
    ipLastAvailableDirection: string
}


function App() {
  const [ipAddress, setIpAddress] = useState("192.168.1.0");
  const [subnetMask, setSubnetMask] = useState("255.255.255.0");
  const [desiredSubnets, setDesiredSubnets] = useState("4");
  const [subnetsIpInformation, setSubnetsIpInformation] = useState<InformationNewSubnets[]>([]);
    useEffect(() => {
        console.log('Updated subnetsIpInformation:', subnetsIpInformation);
    }, [subnetsIpInformation]);
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
        function ipToBinary(ip: string){
            return ip.split(".").map(octet => parseInt(octet, 10).toString(2).padStart(8, "0")).join("")
        }

        function fromBinaryToDecimal(ipInBinary: string){
            const ipInOctets = new Array(4)

            for( let i = 0; i < ipInOctets.length; i++){
                ipInOctets[i] = parseInt(ipInBinary.slice(i * 8, (i + 1)*8), 2)

            }

            return ipInOctets.join(".")
        }

        function networkBinary(IP_ADDRESS: string, submaskBinary: string) {
            const ipInBinary = ipToBinary(IP_ADDRESS);
            return ipInBinary.split('').map((bit, index) => (bit === '1' && submaskBinary[index] === '1') ? "1" : "0").join("");
        }

        const submaskBinary = ipToBinary(subnetMask)
        const submaskCIDR = submaskBinary.split("").filter(bit => bit === "1").length

        const neededBits = Math.ceil(Math.log2(parseInt(desiredSubnets)))
        const newSubMaskCIDR = submaskCIDR + neededBits

        const newSubmaskInBinary = "1".repeat(newSubMaskCIDR) + "0".repeat(32 - newSubMaskCIDR)

        const newSubmaskInDecimal = fromBinaryToDecimal(newSubmaskInBinary)



        const networkIpInBinary = networkBinary(ipAddress, submaskBinary)
        console.log(networkIpInBinary)
        const networkAddressWithoutHostBits = networkIpInBinary.slice(0, 32 - (32 - submaskCIDR))

        function generateBinaryStrings(neededBits: number) {
            const binaryStrings = [];
            const maxNumber = Math.pow(2, neededBits); // Calculate the maximum number for the given bits

            for (let i = 0; i < maxNumber; i++) {
                const binaryString = i.toString(2).padStart(neededBits, '0'); // Convert to binary and pad with zeros
                binaryStrings.push(binaryString);
            }

            return binaryStrings;
        }

        console.log(submaskCIDR)
        console.log(newSubMaskCIDR)
        const subnetsToPush = []
        for (let i = 0; i < Number(desiredSubnets); i++){
            console.log("network address is: ", networkAddressWithoutHostBits)
            const ipGateway = fromBinaryToDecimal(networkAddressWithoutHostBits + generateBinaryStrings(neededBits)[i] + "0".repeat(32 - newSubMaskCIDR))
            const ipBroadcastDirection = fromBinaryToDecimal(networkAddressWithoutHostBits + generateBinaryStrings(neededBits)[i] + "1".repeat(32 - newSubMaskCIDR))
            const ipFirstAvailableDirection = fromBinaryToDecimal(networkAddressWithoutHostBits + generateBinaryStrings(neededBits)[i] + "0".repeat(32 - newSubMaskCIDR - 1) + "1")
            const ipLastAvailableDirection = fromBinaryToDecimal(networkAddressWithoutHostBits + generateBinaryStrings(neededBits)[i] + "1".repeat(32 - newSubMaskCIDR - 1) + "0")

            subnetsToPush.push({
                ipGateway,
                ipBroadcastDirection,
                subnetMask: newSubmaskInDecimal,
                ipFirstAvailableDirection,
                ipLastAvailableDirection
            })
            // Extract host bits from the network address in binary
            // add the available hosts and needed padding calculations in binary
            console.log(`-------- Subnet ${i + 1} ------------`)
            console.log("ipGateway in binary: ", networkAddressWithoutHostBits + "/" + generateBinaryStrings(neededBits)[i] + "/" + "0".repeat(32 - newSubMaskCIDR))
            console.log("ip broadcast: ",networkAddressWithoutHostBits + "/" + generateBinaryStrings(neededBits)[i] + "/" + "1".repeat(32 - newSubMaskCIDR))
            console.log("ip first Ip possible: ", networkAddressWithoutHostBits + "/" + generateBinaryStrings(neededBits)[i] + "/" + "0".repeat(32 - newSubMaskCIDR - 1) + "1")
            console.log("ip last ip possible:", networkAddressWithoutHostBits.length + "/" + generateBinaryStrings(neededBits)[i].length + "/" + "1".repeat(32 - newSubMaskCIDR - 1) + "0")
            console.log("ip subnet submask: ", )
            // show the information in dotted decimal
        }
        setSubnetsIpInformation(subnetsToPush)

    }

  const renderIpInformation = () => {
        return subnetsIpInformation.slice(-4, subnetsIpInformation.length).map((ipInformation, index) => {
            return <div className="subnet-card" key={index}>
                <h2>Subnet {index + 1}</h2>
                <p><strong>IPs Gateway:</strong> {ipInformation.ipGateway}</p>
                <p><strong>IPs Broadcast Direction:</strong> {ipInformation.ipBroadcastDirection}</p>
                <p><strong>IPs Subnet Mask:</strong> {ipInformation.subnetMask}</p>
                <p><strong>IPs First Available Direction:</strong> {ipInformation.ipFirstAvailableDirection}</p>
                <p><strong>IPs Last Available Direction:</strong> {ipInformation.ipLastAvailableDirection}</p>
            </div>
        })
  }

    return (
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
    )
}

export default App


// TODO: Fix bug on setting the state
// TODO: Fix calculateAvailableRanges

