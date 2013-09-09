/**
 * Copyright 2012 Nikita Koksharov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.corundumstudio.socketio.transport;

import io.netty.channel.ChannelInboundHandlerAdapter;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.corundumstudio.socketio.Disconnectable;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.misc.CompositeIterable;

public abstract class BaseTransport extends ChannelInboundHandlerAdapter implements Disconnectable {

    protected Iterable<SocketIOClient> getAllClients(Collection<? extends BaseClient> clients) {
        List<Iterable<SocketIOClient>> allClients = new ArrayList<Iterable<SocketIOClient>>(clients.size());
        for (BaseClient client : clients) {
            allClients.add(client.getAllChildClients());
        }
        return new CompositeIterable<SocketIOClient>(allClients);
    }

}
