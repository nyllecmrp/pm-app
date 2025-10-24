import initSqlJs, { Database } from 'sql.js';
import { ProductionSession } from '../types';

class DatabaseService {
  private db: Database | null = null;
  private isInitialized = false;
  private SQL: any = null;

  async connect() {
    if (this.isInitialized) return;

    try {
      // Initialize sql.js
      this.SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });

      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem('production_monitoring_db');

      if (savedDb) {
        // Load existing database
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new this.SQL.Database(uint8Array);
        console.log('Loaded existing SQLite database from localStorage');
      } else {
        // Create new database
        this.db = new this.SQL.Database();
        console.log('Created new SQLite database');
      }

      await this.initializeTables();
      this.isInitialized = true;
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite:', error);
    }
  }

  private async initializeTables() {
    if (!this.db) return;

    try {
      // Create production_sessions table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS production_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          line TEXT NOT NULL,
          date TEXT NOT NULL,
          plan_target REAL NOT NULL,
          achievement_factor REAL NOT NULL,
          required_manpower REAL NOT NULL,
          actual_manpower REAL NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          break_time REAL NOT NULL,
          total_time_hours REAL,
          working_time_hours REAL,
          hourly_target REAL,
          tact_time REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create time_slots table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS time_slots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id INTEGER NOT NULL,
          time_slot TEXT NOT NULL,
          working_time REAL NOT NULL,
          plan REAL NOT NULL,
          plan_cumulative REAL NOT NULL,
          actual REAL NOT NULL,
          variance REAL NOT NULL,
          productivity_rate REAL NOT NULL,
          FOREIGN KEY (session_id) REFERENCES production_sessions(id) ON DELETE CASCADE
        )
      `);

      // Save database to localStorage
      this.saveDatabase();
      console.log('Database tables initialized');
    } catch (error) {
      console.error('Failed to initialize tables:', error);
    }
  }

  private saveDatabase() {
    if (!this.db) return;

    try {
      const data = this.db.export();
      const dataArray = Array.from(data);
      localStorage.setItem('production_monitoring_db', JSON.stringify(dataArray));
    } catch (error) {
      console.error('Failed to save database to localStorage:', error);
    }
  }

  async saveSession(session: ProductionSession): Promise<number | null> {
    if (!this.db) {
      console.warn('Database not initialized');
      return null;
    }

    try {
      const now = new Date().toISOString();

      if (session.id) {
        // Update existing session
        this.db.run(
          `UPDATE production_sessions SET
            line = ?, date = ?, plan_target = ?, achievement_factor = ?,
            required_manpower = ?, actual_manpower = ?, start_time = ?,
            end_time = ?, break_time = ?, total_time_hours = ?,
            working_time_hours = ?, hourly_target = ?, tact_time = ?,
            updated_at = ?
          WHERE id = ?`,
          [
            session.line,
            session.date,
            session.planTarget,
            session.achievementFactor,
            session.requiredManpower,
            session.actualManpower,
            session.startTime,
            session.endTime,
            session.breakTime,
            session.metrics.totalTimeHours,
            session.metrics.workingTimeHours,
            session.metrics.hourlyTarget,
            session.metrics.tactTime,
            now,
            session.id
          ]
        );

        // Delete old time slots and insert new ones
        this.db.run('DELETE FROM time_slots WHERE session_id = ?', [session.id]);

        for (const slot of session.timeSlots) {
          this.db.run(
            `INSERT INTO time_slots (
              session_id, time_slot, working_time, plan, plan_cumulative,
              actual, variance, productivity_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              session.id,
              slot.timeSlot,
              slot.workingTime,
              slot.plan,
              slot.planCumulative,
              slot.actual,
              slot.variance,
              slot.productivityRate
            ]
          );
        }

        this.saveDatabase();
        console.log('Session updated successfully with ID:', session.id);
        return session.id;
      } else {
        // Insert new session
        this.db.run(
          `INSERT INTO production_sessions (
            line, date, plan_target, achievement_factor, required_manpower,
            actual_manpower, start_time, end_time, break_time,
            total_time_hours, working_time_hours, hourly_target, tact_time,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            session.line,
            session.date,
            session.planTarget,
            session.achievementFactor,
            session.requiredManpower,
            session.actualManpower,
            session.startTime,
            session.endTime,
            session.breakTime,
            session.metrics.totalTimeHours,
            session.metrics.workingTimeHours,
            session.metrics.hourlyTarget,
            session.metrics.tactTime,
            now,
            now
          ]
        );

        // Get the last inserted session ID
        const result = this.db.exec('SELECT last_insert_rowid() as id');
        const sessionId = result[0].values[0][0] as number;

        // Save time slots
        for (const slot of session.timeSlots) {
          this.db.run(
            `INSERT INTO time_slots (
              session_id, time_slot, working_time, plan, plan_cumulative,
              actual, variance, productivity_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              sessionId,
              slot.timeSlot,
              slot.workingTime,
              slot.plan,
              slot.planCumulative,
              slot.actual,
              slot.variance,
              slot.productivityRate
            ]
          );
        }

        // Save database to localStorage
        this.saveDatabase();
        console.log('Session saved successfully with ID:', sessionId);
        return sessionId;
      }
    } catch (error) {
      console.error('Failed to save session:', error);
      return null;
    }
  }

  async getSessions(limit = 50): Promise<ProductionSession[]> {
    if (!this.db) {
      console.warn('Database not initialized');
      return [];
    }

    try {
      const sessionsResult = this.db.exec(
        `SELECT * FROM production_sessions
         ORDER BY date DESC, created_at DESC
         LIMIT ?`,
        [limit]
      );

      if (!sessionsResult.length) return [];

      const result: ProductionSession[] = [];
      const columns = sessionsResult[0].columns;
      const rows = sessionsResult[0].values;

      for (const row of rows) {
        const sessionData: any = {};
        columns.forEach((col, idx) => {
          sessionData[col] = row[idx];
        });

        // Get time slots for this session
        const slotsResult = this.db.exec(
          `SELECT * FROM time_slots WHERE session_id = ? ORDER BY id`,
          [sessionData.id]
        );

        const timeSlots = slotsResult.length ? slotsResult[0].values.map((slotRow: any) => ({
          id: slotRow[0].toString(),
          timeSlot: slotRow[2],
          workingTime: slotRow[3],
          plan: slotRow[4],
          planCumulative: slotRow[5],
          actual: slotRow[6],
          variance: slotRow[7],
          productivityRate: slotRow[8],
        })) : [];

        result.push({
          id: sessionData.id,
          line: sessionData.line,
          date: sessionData.date,
          planTarget: sessionData.plan_target,
          achievementFactor: sessionData.achievement_factor,
          requiredManpower: sessionData.required_manpower,
          actualManpower: sessionData.actual_manpower,
          startTime: sessionData.start_time,
          endTime: sessionData.end_time,
          breakTime: sessionData.break_time,
          metrics: {
            totalTimeHours: sessionData.total_time_hours,
            workingTimeHours: sessionData.working_time_hours,
            hourlyTarget: sessionData.hourly_target,
            tactTime: sessionData.tact_time,
            planTarget: sessionData.plan_target,
            achievementFactor: sessionData.achievement_factor,
            requiredManpower: sessionData.required_manpower,
            actualManpower: sessionData.actual_manpower,
          },
          timeSlots,
          createdAt: sessionData.created_at,
          updatedAt: sessionData.updated_at,
        });
      }

      return result;
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  }

  async deleteSession(id: number): Promise<boolean> {
    if (!this.db) return false;

    try {
      this.db.run('DELETE FROM production_sessions WHERE id = ?', [id]);
      this.saveDatabase();
      console.log('Session deleted:', id);
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  async exportDatabase(): Promise<Uint8Array | null> {
    if (!this.db) return null;
    return this.db.export();
  }

  async importDatabase(data: Uint8Array): Promise<boolean> {
    if (!this.SQL) return false;

    try {
      this.db = new this.SQL.Database(data);
      this.saveDatabase();
      console.log('Database imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import database:', error);
      return false;
    }
  }

  async clearDatabase(): Promise<boolean> {
    try {
      localStorage.removeItem('production_monitoring_db');
      if (this.SQL) {
        this.db = new this.SQL.Database();
        await this.initializeTables();
      }
      console.log('Database cleared successfully');
      return true;
    } catch (error) {
      console.error('Failed to clear database:', error);
      return false;
    }
  }
}

export const dbService = new DatabaseService();
