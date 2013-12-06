package space.celestials;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import sql.SQL;

public class Asteroid  extends Celestial{
  @Override
  public String toString() {
    return "Asteroid " + super.toString();
  }
  
  private static SQL sql = SQL.getInstance();
  private static PreparedStatement select = sql.prepareStatement("SELECT * FROM `asteroids` WHERE `celestial_id`=?");
  
  private Coord[] _points;
  
  public Asteroid(StarSystem system, Celestial parent, ResultSet r) throws SQLException {
    super(system, parent, r);
    _add = new Add();
    
    select.setInt(1, parent.id);
    
    try(ResultSet r2 = select.executeQuery()) {
      if(r2.next()) {
        x = r2.getDouble("x");
        y = r2.getDouble("y");
        
        String[] points = r2.getString("points").split(",");
        _points = new Coord[points.length];
        
        int n = 0;
        for(int i = 0; i < _points.length; i++) {
          _points[i] = new Coord(Double.parseDouble(points[n++]), Double.parseDouble(points[n++]));
        }
      }
    }
  }
  
  public class Add extends Celestial.Add {
    public String getT() { return "a"; }
    public Coord[] getP() { return _points; }
  }
}