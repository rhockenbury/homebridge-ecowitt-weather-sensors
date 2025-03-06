#
# This script will fetch information directly from the base station.
#

import socket

station_ip = "192.168.1.196"
station_port = 45000

cmd_get_MAC = "\xff\xff\x26\x03\x29"
cmd_get_FWver = "\xff\xff\x50\x03\x53"

def sendToWS(ws_ipaddr, ws_port, cmd):
  tries = 5
  v = 0
  data = ""
  while data == "" and v <= tries:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    s.settimeout(3)
    try:
      s.connect((ws_ipaddr, int(ws_port)))
      print(cmd)
      s.sendall(cmd)
      data, addr = s.recvfrom(11200)
      s.close()
    except:
      pass
    v +=1
  return data


# fetch firmware from station
data = sendToWS(station_ip, station_port, bytearray(cmd_get_FWver,'latin-1'))

print(data)

cur_ver = ""
for i in range(5,5+data[4]): cur_ver += chr(data[i])

print(cur_ver)

# fetch mac from station
data = sendToWS(station_ip, station_port, bytearray(cmd_get_MAC,'latin-1'))

mac = ""
for i in range(4,10):
  print(data[i])
  if data[i] < 10: mac += "0"
  mac += str(hex(data[i]))+":"

mac = mac.replace("0x","").upper()[:-1]

print(mac)
