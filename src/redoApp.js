const IP_ADDRESS = "192.168.1.0"
const SUBNET_MASK = "255.255.0.0"
const DESIRED_SUBNETS = "4"

function calculateSubnets(){
    function ipToBinary(ip){
        return ip.split(".").map(octet => parseInt(octet, 10).toString(2).padStart(8, "0")).join("")
    }

    function fromBinaryToDecimal(ipInBinary){
        //console.log("ipInBinary is: ", ipInBinary)
        //console.log(ipInBinary.length)
        const ipInOctets = new Array(4)
        //console.log(ipInOctets.length)

        for( let i = 0; i < ipInOctets.length; i++){
            ipInOctets[i] = parseInt(ipInBinary.slice(i * 8, (i + 1)*8), 2)

        }

        return ipInOctets.join(".")
    }

    function fromDecimalToBinary(decimal){
        //console.log("decimal: ", decimal)
        const decimalInBinary = parseInt(decimal).toString(2).padStart(32 - submaskCIDR, "0")
        //console.log("decimal in binary is", decimalInBinary)
        return decimalInBinary
    }

    function networkBinary(IP_ADDRESS, submaskBinary) {
        const ipInBinary = ipToBinary(IP_ADDRESS);
        return ipInBinary.split('').map((bit, index) => (bit === '1' && submaskBinary[index] === '1') ? "1" : "0").join("");
    }

    const submaskBinary = ipToBinary(SUBNET_MASK)
    //console.log("Submask in Binary: ", submaskBinary)
    const submaskCIDR = submaskBinary.split("").filter(bit => bit !== "1").length
    //console.log("Submask in CIDR: ", submaskCIDR)
    const neededBits = Math.ceil(Math.log2(parseInt(DESIRED_SUBNETS)))
    //console.log("Needed Bits: ", neededBits)
    const newSubMaskCIDR = submaskCIDR + neededBits
    //console.log("New SubmaskCIDR: ", newSubMaskCIDR)

    const newSubmaskInBinary = "1".repeat(newSubMaskCIDR) + "0".repeat(32 - newSubMaskCIDR)

    const newSubmaskInDecimal = fromBinaryToDecimal(newSubmaskInBinary)
    //console.log(newSubmaskInDecimal)

    const numberOfAvailableHosts = Math.pow(2, 32 - newSubMaskCIDR) - 2
    //console.log("Number of available hosts for each subnet: ", numberOfAvailableHosts)

    const numberOfAvailableHostsInBinary = fromDecimalToBinary(numberOfAvailableHosts)
    //console.log(numberOfAvailableHostsInBinary)

    const networkIpInBinary = networkBinary(IP_ADDRESS, submaskBinary)
    //console.log("networkIpInBinary: ", networkIpInBinary)

    const networkAddressWithoutHostBits = networkIpInBinary.slice(0, 32 - submaskCIDR)
    //console.log("network address without host bits: ", networkAddressWithoutHostBits)

    const networkIpAddressInDecimal = fromBinaryToDecimal(networkIpInBinary)
    console.clear()
    for (let i = 0; i < Number(DESIRED_SUBNETS); i++){

        // Extract host bits from the network address in binary
        // add the available hosts and needed padding calculations in binary
        console.log(`-------- Subnet ${i + 1} ------------`)
        console.log("ip Gateway: ", fromBinaryToDecimal(networkAddressWithoutHostBits + (fromDecimalToBinary(numberOfAvailableHosts * i))))
        console.log("ip broadcast: ", fromBinaryToDecimal(networkAddressWithoutHostBits + fromDecimalToBinary((numberOfAvailableHosts + 1) * (i + 1))))
        console.log("ip first Ip possible: ", fromBinaryToDecimal(networkAddressWithoutHostBits + fromDecimalToBinary((numberOfAvailableHosts * i) + 1)))
        console.log("ip last ip possible:", fromBinaryToDecimal(networkAddressWithoutHostBits + fromDecimalToBinary((numberOfAvailableHosts * (i + 1) - 1))))
        console.log("ip subnet submask: ", newSubmaskInDecimal)
        // show the information in dotted decimal
    }

}
console.clear()
calculateSubnets()