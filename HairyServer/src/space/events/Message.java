package space.events;

import space.Server;
import space.Ship;
import space.User;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.listener.DataListener;

public class Message implements DataListener<User.Message> {
  private Server _server = Server.instance();
  
  @Override
  public void onData(SocketIOClient client, User.Message data, AckRequest ackSender) {
    User user = _server.userFromSocket(client);
    Ship ship = user.ship();
    
    // Temporary chat commands
    if(data.msg.startsWith("/")) {
      final String[] msg = data.msg.split(" ");
      switch(msg[0]) {
        case "/warp":
          try {
            ship.x = Double.parseDouble(msg[1]);
            ship.y = Double.parseDouble(msg[2]);
          } catch(Exception ex) {
            client.sendEvent("ms", new User.Message("Server", "Usage: warp x y"));
          }
          
          return;
          
        case "/stop":
          ship.stop();
          return;
          
        case "/zoom":
          try {
            //TODO: This is a stupid way of doing it
            _server.broadcastEvent("zoom", new Object() {
              public double zoom = Double.parseDouble(msg[1]);
            });
          } catch(Exception ex) {
            client.sendEvent("ms", new User.Message("Server", "Usage: zoom n"));
          }
          return;
          
        case "/angle":
          try {
            ship.angle = Integer.parseInt(msg[1]);
          } catch(Exception ex) {
            client.sendEvent("ms", new User.Message("Server", "Usage: angle n"));
          }
          return;
      }
    }
    
    _server.broadcastEvent("ms", new User.Message(user.name, data.msg));
  }
}