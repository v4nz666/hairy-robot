package main;

import space.Server;
import util.LoggerFactory;

public class Main {
  public static void main(String[] args) throws InterruptedException, InstantiationException, IllegalAccessException {
    LoggerFactory.getLogger().enableInfo = false;
    LoggerFactory.getLogger().enableTrace = false;
    Server.instance().start();
  }
}