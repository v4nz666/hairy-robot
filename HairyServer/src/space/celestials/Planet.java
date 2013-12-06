package space.celestials;

import java.sql.ResultSet;
import java.sql.SQLException;

public class Planet extends Celestial {
  @Override
  public String toString() {
    return "Planet " + super.toString();
  }
  
  public Planet(StarSystem system, Celestial parent, ResultSet r) throws SQLException {
    super(system, parent, r);
    _add = new Add();
  }
  
  public class Add extends Celestial.Add {
    public String getFill() { return "blue"; }
  }
}