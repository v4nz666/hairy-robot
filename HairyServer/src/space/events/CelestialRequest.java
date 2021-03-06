package space.events;

import space.Server;
import space.models.Ship;
import space.physics.Entity;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.listener.DataListener;

public class CelestialRequest implements DataListener<Entity.Request> {
  private static Server _server = Server.instance();
  
  @Override
  public void onData(SocketIOClient client, Entity.Request data, AckRequest ackSender) {
    Ship ship = _server.userFromSocket(client).ship();
    ship.system.sendCelestials(ship, data);
  }
}