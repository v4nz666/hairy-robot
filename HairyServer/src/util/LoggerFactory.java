package util;

public class LoggerFactory {
  private static LoggerFactory _instance = new LoggerFactory();
  public static LoggerFactory getLogger() {
    return _instance;
  }
  
  public static LoggerFactory getLogger(Class<?> c) {
    return _instance;
  }
  
  public boolean isTraceEnabled() {
    return true;
  }
  
  public boolean isDebugEnabled() {
    return true;
  }
  
  public void trace(String format, Object... args) {
    for(Object arg : args) { format = format.replaceFirst("\\{.*?\\}", arg.toString()); }
    System.out.println(format);
  }
  
  public void debug(String format, Object... args) {
    for(Object arg : args) { format = format.replaceFirst("\\{.*?\\}", arg.toString()); }
    System.out.println(format);
  }
  
  public void info(String format, Object... args) {
    for(Object arg : args) { format = format.replaceFirst("\\{.*?\\}", arg.toString()); }
    System.out.println(format);
  }
  
  public void warn(String format, Object... args) {
    for(Object arg : args) { format = format.replaceFirst("\\{.*?\\}", arg.toString()); }
    System.out.println(format);
  }
  
  public void error(String format, Object... args) {
    for(Object arg : args) { format = format.replaceFirst("\\{.*?\\}", arg.toString()); }
    System.out.println(format);
  }
}