package space.events;

import space.Server;
import space.User;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.listener.DataListener;

public class Login implements DataListener<User.Login> {
  private Server _server = Server.instance();
  
  @Override
  public void onData(SocketIOClient client, User.Login data, AckRequest ackSender) {
    _server.addUser(client, data);
  }
}