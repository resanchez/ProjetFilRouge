# coding: utf-8


import sys
import os
from twisted.web.static import File
from twisted.python import log
from twisted.web.server import Site
from twisted.internet import reactor
from autobahn.twisted.websocket import WebSocketServerProtocol
from autobahn.twisted.websocket import WebSocketServerFactory

import json
from preprocessing import *
import glob
import pandas as pd

# from src.preprocessing import *

functions = {'addSelectedFiles': add_selected_files, 'getLCSPData': get_lc_sp_data,
             'getPCData': get_pc_data, 'deleteFile': delete_file, 'getLCSPGeneralizedData': get_lc_sp_generalized_data,
             'getSPGeneralizedData': get_sp_generalized_data, 'buildDF': build_df}


class MyServerProtocol(WebSocketServerProtocol):
    def onConnect(self, request):
        print("Client connecting: {}".format(request.peer))

    def onOpen(self):
        print("WebSocket connection open.")
        msg = {
            'fct': "initInfos",
            'data': infos
        }
        self.sendMessage(json.dumps(msg).encode('utf8'), False)

    def onMessage(self, payload, isBinary):
        if isBinary:
            print("Binary message received: {} bytes".format(len(payload)))
        else:
            msg = handle_msg(payload)
            if msg:
                self.sendMessage(msg.encode('utf8'), False)

    def onClose(self, wasClean, code, reason):
        print("WebSocket connection closed: {}".format(reason))


def handle_msg(msg):
    request = json.loads(msg.decode('utf8'))
    print("Text message received")
    print("Request : " + request['fct'])

    res = functions[request['fct']](data=request["data"], group=request["group"], args=request["args"])

    dump = json.dumps({'data': res,
                       'fct': request['fct']})

    return dump


if __name__ == '__main__':
    # static file server seving index_old.html as root

    root = File(".")
    infos = {}
    folder_path = sys.argv[1]
    files = glob.glob(folder_path + "/*.csv")
    df = pd.DataFrame()
    list = []
    for f in files:
        fname = os.path.basename(f)
        frame = pd.read_csv(f)
        frame["idxFile"] = fname
        frame["power"] = frame["power"].fillna(method="ffill")
        list.append(frame)
        agg = frame.groupby('phase_no').size().to_dict()
        infos[fname] = {
            "nbRows": len(frame),
            "phasesInfo": agg
        }

    df = pd.concat(list, ignore_index=True)
    cols = df.columns.map(lambda x: x.replace(' ', '_').replace('.', '') if isinstance(x, (bytes, str)) else x)
    df.columns = cols
    print(df.columns)
    df = df.drop('Unnamed:_0', axis=1)
    store_df(df)

    # Store infos in a json file if needed for debug
    if sys.argv[2]:
        with open(sys.argv[2], 'w') as fp:
            json.dump(infos, fp)

    # cols = d.columns
    # cols = cols.map(lambda x: x.replace(' ', '_').replace('.', '') if isinstance(x, (bytes, str)) else x)
    # d.columns = cols
    # frames = [df0, d]
    # df0 = pd.concat(frames).drop_duplicates().reset_index(drop=True)

    log.startLogging(sys.stdout)

    factory = WebSocketServerFactory()
    factory.protocol = MyServerProtocol

    reactor.listenTCP(9000, factory)
    site = Site(root)
    reactor.listenTCP(8080, site)
    reactor.run()
