package space.events;

import main.Server;
import main.User;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.listener.DataListener;

public class Keys implements DataListener<User.Keys> {
  private Server _server = Server.instance();
  
  @Override
  public void onData(SocketIOClient client, User.Keys data, AckRequest ackSender) {
    _server.userFromSocket(client).handleInput(data.keys);
  }
}