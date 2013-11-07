package space.events;

import space.Server;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.listener.DisconnectListener;

public class Disconnect implements DisconnectListener {
  private Server _server = Server.instance();
  
  @Override
  public void onDisconnect(SocketIOClient client) {
    _server.removeUser(client);
  }
}