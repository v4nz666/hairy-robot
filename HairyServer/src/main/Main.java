package main;

import space.Server;

public class Main {
  public static void main(String[] args) throws InterruptedException, InstantiationException, IllegalAccessException {
    Server.instance().start();
  }
}