package space.events;

import space.Server;
import space.Ship;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.listener.DataListener;

public class UseShip implements DataListener<Ship.Use> {
  private Server _server = Server.instance();
  
  @Override
  public void onData(SocketIOClient client, Ship.Use data, AckRequest ackSender) {
    _server.userFromSocket(client).useShip(data);
  }
}