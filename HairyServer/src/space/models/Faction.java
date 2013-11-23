package space.models;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import space.celestials.StarSystem;
import sql.SQL;

public class Faction {
  private static SQL sql = SQL.getInstance();
  private static PreparedStatement select = sql.prepareStatement("SELECT * FROM `factions` WHERE `system_id`=?");
  
  public static ArrayList<Faction> load(StarSystem system) throws SQLException {
    select.setInt(1, system.id);
    
    try(ResultSet r = select.executeQuery()) {
      ArrayList<Faction> faction = new ArrayList<>();
      
      while(r.next()) {
        faction.add(new Faction(system, r.getInt("id"), r.getString("name"), r.getBoolean("can_join")));
      }
      
      return faction;
    }
  }
  
  public final int id;
  public final StarSystem system;
  public final String name;
  public final boolean joinable;
  
  private Faction(StarSystem system, int id, String name, boolean joinable) {
    this.id = id;
    this.system = system;
    this.name = name;
    this.joinable = joinable;
  }
}