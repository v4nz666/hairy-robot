package space.events;

import main.Msg;
import main.Server;
import main.User;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.listener.DataListener;

public class Message implements DataListener<Msg> {
  private Server _server = Server.instance();
  
  @Override
  public void onData(SocketIOClient client, Msg data, AckRequest ackSender) {
    User user = _server.userFromSocket(client);
    
    // Temporary chat commands
    if(data.msg.startsWith("/")) {
      final String[] msg = data.msg.split(" ");
      switch(msg[0]) {
        case "/warp":
          try {
            double x = Double.parseDouble(msg[1]);
            double y = Double.parseDouble(msg[2]);
            user.x = Math.min(Math.max(x, 0), user.system().getSize());
            user.y = Math.min(Math.max(y, 0), user.system().getSize());
          } catch(Exception ex) {
            client.sendEvent("msg", new Msg("Server", "Usage: warp x y"));
          }
          
          return;
          
        case "/gun":
          user.setGun(space.data.guns.Gun.getGunRandom());
          _server.broadcastEvent("stats", user.serializeStats());
          return;
          
        case "/stop":
          user.stop();
          return;
          
        case "/zoom":
          try {
            //TODO: This is a stupid way of doing it
            _server.broadcastEvent("zoom", new Object() {
              public double zoom = Double.parseDouble(msg[1]);
            });
          } catch(Exception ex) {
            client.sendEvent("msg", new Msg("Server", "Usage: zoom n"));
          }
          return;
          
        case "/angle":
          try {
            user.angle = Integer.parseInt(msg[1]);
          } catch(Exception ex) {
            client.sendEvent("msg", new Msg("Server", "Usage: angle n"));
          }
          return;
      }
    }
    
    _server.broadcastEvent("msg", new Msg(user.name, data.msg));
  }
}