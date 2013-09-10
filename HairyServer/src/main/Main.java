package main;

import util.LoggerFactory;

public class Main {
  public static void main(String[] args) throws InterruptedException {
    System.out.println("Starting");
    LoggerFactory.getLogger().enableInfo = false;
    LoggerFactory.getLogger().enableTrace = false;
    Server.instance().start();
  }
}