package space.celestials;

import java.sql.ResultSet;
import java.sql.SQLException;

public class Moon extends Celestial {
  @Override
  public String toString() {
    return "Moon " + super.toString();
  }
  
  public Moon(StarSystem system, Celestial parent, ResultSet r) throws SQLException {
    super(system, parent, r);
    _add = new Add();
  }
  
  public class Add extends Celestial.Add {
    public String getFill() { return "grey"; }
  }
}