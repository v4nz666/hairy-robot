package main;

import java.sql.SQLException;

import space.Server;

public class Main {
  public static void main(String[] args) throws InterruptedException, InstantiationException, IllegalAccessException, SQLException {
    Server.instance().start();
  }
}