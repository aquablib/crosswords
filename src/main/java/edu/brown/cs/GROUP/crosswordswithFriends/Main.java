package edu.brown.cs.GROUP.crosswordswithFriends;

import edu.brown.cs.GROUP.database.Database;
import edu.brown.cs.GROUP.words.CSVReader;
import edu.brown.cs.GROUP.words.TXTReader;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;

/** This class handles starting the program, the database, and the GUI.
 *
 * @author smg1 */

public final class Main {

  /** Initializes the program being run.
   *
   * @param args the arguments from the command line */
  public static void main(String[] args) {
    try {
      run();
    } catch (IOException e) {
      System.exit(1);
    }

  }

  /** This is the private instance variable of the arguments from the command
   * line. */

  private String[] arguments;

  /** That is the port number. */

  private static final int PORT = getHerokuAssignedPort();
  
  static int getHerokuAssignedPort() {
    ProcessBuilder processBuilder = new ProcessBuilder();
    if (processBuilder.environment().get("PORT") != null) {
        return Integer.parseInt(processBuilder.environment().get("PORT"));
    }
    return 4567; //return default port if heroku-port isn't set (i.e. on localhost)
}

  /** This constructor takes the arguments from the command line and sets it to
  /**
   * The argument length.
   */

  private static final int LENGTH = 3;

  /**
   * This constructor takes the arguments from the command line and sets it to
   * the private instance variable.
   *
   * @param args arguments from command line interface */

  private Main(String[] args) {
    this.arguments = args;
  }

  /** This is the method that runs the program, starting the database and the
   * GUI.
   *
   * @throws IOException when the corpus file is cannot be opened */

  private static void run() throws IOException {


    Database db = null;

    String path = "data/cluewords.sqlite3";
        try {
          db = new Database(path);
        } catch (ClassNotFoundException e1) {
          // TODO Auto-generated catch block
          e1.printStackTrace();
        } catch (SQLException e1) {
          // TODO Auto-generated catch block
          e1.printStackTrace();
        }
      new GUI(PORT, db);
    }
  }
