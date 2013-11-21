package space.events;

import space.Server;
import space.Ship;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.listener.DataListener;

public class Keys implements DataListener<Ship.Keys> {
  private Server _server = Server.instance();
  
  @Override
  public void onData(SocketIOClient client, Ship.Keys data, AckRequest ackSender) {
    _server.userFromSocket(client).ship().handleInput(data);
  }
}