package space.models;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import sql.SQL;

public class Faction {
  private static SQL sql = SQL.getInstance();
  private static PreparedStatement select = sql.prepareStatement("SELECT * FROM `users`");
  
  public static ArrayList<Faction> load() throws SQLException {
    try(ResultSet r = select.executeQuery()) {
      ArrayList<Faction> faction = new ArrayList<>();
      
      while(r.next()) {
        faction.add(new Faction(r.getInt("id"), r.getString("name"), r.getBoolean("can_join")));
      }
      
      return faction;
    }
  }
  
  public final int id;
  public final String name;
  public final boolean joinable;
  
  private Faction(int id, String name, boolean joinable) {
    this.id = id;
    this.name = name;
    this.joinable = joinable;
  }
}