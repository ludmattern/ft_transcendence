from scapy.all import ARP, Ether, srp

def scan_network(network="10.13.0.0/24"):
    arp_request = ARP(pdst=network)
    ether = Ether(dst="ff:ff:ff:ff:ff:ff")
    packet = ether / arp_request
    result = srp(packet, timeout=2, verbose=False)[0]

    devices = []
    for sent, received in result:
        devices.append(received.psrc)

    return devices

# Utilisation
active_ips = scan_network("10.13.0.0/24")
print("Machines actives sur le réseau :", active_ips)
