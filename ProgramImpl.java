/* Auto-generated ProgramImpl Code */

import java.util.*;              /* java Predefined*/
import javax.baja.nre.util.*;    /* nre Predefined*/
import javax.baja.sys.*;         /* baja Predefined*/
import javax.baja.status.*;      /* baja Predefined*/
import javax.baja.util.*;        /* baja Predefined*/
import com.tridium.program.*;    /* program-rt Predefined*/
import javax.baja.naming.*;      /* baja User Defined*/
import javax.baja.job.*;         /* baja User Defined*/
import javax.baja.tagdictionary.*; /* tagdictionary-rt User Defined*/
import javax.baja.tag.*;         /* tagdictionary-rt User Defined*/
import javax.baja.control.*;     /* control-rt User Defined*/
import javax.baja.control.ext.*; /* control-rt User Defined*/
import javax.baja.file.*;        /* baja User Defined*/
import java.io.*;                /* java User Defined*/

public class ProgramImpl
  extends com.tridium.program.ProgramBase
{

////////////////////////////////////////////////////////////////
// Getters
////////////////////////////////////////////////////////////////

  public BOrd getStartingOrd() { return (BOrd)get("startingOrd"); }
  public String getNamespaceLookup() { return getString("namespaceLookup"); }

////////////////////////////////////////////////////////////////
// Setters
////////////////////////////////////////////////////////////////

  public void setStartingOrd(javax.baja.naming.BOrd v) { set("startingOrd", v); }
  public void setNamespaceLookup(String v) { setString("namespaceLookup", v); }

////////////////////////////////////////////////////////////////
// Program Source
////////////////////////////////////////////////////////////////

    public void onExecute() throws Exception
      {
        // Create an instance of the inner class Runnable and submit it to the job service
        MyTask task = new MyTask();
        task.submit();
      }
    
      public class MyTask implements Runnable
      {
        private BRunnableJob job;
    
        public MyTask()
        {
          // Create a new BRunnableJob which will encapsulate the Runnable
          // and represent the task in the Job Service.
          job = new BRunnableJob(this);
        }
    
        public void submit()
        {
          // Instruct the job to submit itself to the Job Service and start processing.
          job.submit(null);
        }
    
        public void run()
        {
          try
          {
            job.log().message("Starting namespace tag query...");
    
            // Get the tag dictionary service from the station
            BOrd ord = BOrd.make("station:|slot:/Services/TagDictionaryService");
            Object service = ord.get();
    
            if (service == null)
            {
              job.log().message("ERROR: TagDictionaryService not found");
              return;
            }
    
            if (!(service instanceof BTagDictionaryService))
            {
              job.log().message("ERROR: Resolved service is not BTagDictionaryService");
              return;
            }
    
            BTagDictionaryService tagDictionaryService = (BTagDictionaryService) service;
    
            String namespaceLookup = resolveNamespaceLookup();
            if (namespaceLookup == null || namespaceLookup.length() == 0)
            {
              job.log().message("ERROR: namespaceLookup is not configured");
              return;
            }
            job.log().message("Using namespace lookup: " + namespaceLookup + ":*");
    
            // Get the starting ORD from the program configuration
            BOrd startingOrd = getStartingOrd();
            BComponent startingComponent = null;
    
            if (startingOrd != null)
            {
              Object resolved = startingOrd.get();
              if (resolved instanceof BComponent)
              {
                startingComponent = (BComponent) resolved;
                job.log().message("Starting search from: " + startingOrd);
              }
              else
              {
                job.log().message("WARNING: startingOrd does not resolve to a BComponent");
                startingComponent = (BComponent) Sys.getStation();
                job.log().message("Falling back to station root");
              }
            }
            else
            {
              job.log().message("No startingOrd configured, using station root");
              startingComponent = (BComponent) Sys.getStation();
            }
    
            List<String> resultsWithTags = new ArrayList<>();
            List<String> resultsWithoutTags = new ArrayList<>();
            int componentCount = 0;
    
            if (startingComponent != null)
            {
              componentCount = walkComponent(startingComponent, tagDictionaryService, namespaceLookup, resultsWithTags, resultsWithoutTags, job);
            }
    
            // Output points with matching namespace tags
            if (resultsWithTags.isEmpty())
            {
              job.log().message("No points found with namespace '" + namespaceLookup + "'");
            }
            else
            {
              job.log().message("Found " + resultsWithTags.size() + " point(s) WITH '" + namespaceLookup + "' tags:");
              for (String result : resultsWithTags)
              {
                job.log().message("  " + result);
              }
            }
    
            // Output points without matching namespace tags
            if (!resultsWithoutTags.isEmpty())
            {
              job.log().message("");
              job.log().message("Found " + resultsWithoutTags.size() + " point(s) WITHOUT '" + namespaceLookup + "' tags:");
              for (String result : resultsWithoutTags)
              {
                job.log().message("  " + result);
              }
            }
  
            String csv = buildCsv(namespaceLookup, resultsWithTags, resultsWithoutTags);
            BIFile csvFile = writeCsvFile(namespaceLookup, csv);
            job.log().message("");
            job.log().message("CSV file saved to: " + csvFile.getFilePath().toString());
    
            job.log().message("");
            job.log().message("Query complete. Inspected ~" + componentCount + " components.");
            job.progress(100);
          }
          catch (Exception e)
          {
            job.log().message("ERROR: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
          }
        }
    
        private int walkComponent(BComponent component, BTagDictionaryService tagDictionaryService, String namespaceLookup, List<String> resultsWithTags, List<String> resultsWithoutTags, BRunnableJob job)
        {
          if (component == null) return 0;
  
          int visitedCount = 1;
    
          try
          {
            if (component instanceof BAbstractProxyExt)
            {
              BComponent[] children = component.getChildComponents();
              if (children != null)
              {
                for (BComponent child : children)
                {
                  visitedCount += walkComponent(child, tagDictionaryService, namespaceLookup, resultsWithTags, resultsWithoutTags, job);
                }
              }
              return visitedCount;
            }
    
            if (component instanceof BControlPoint)
            {
              String slotPath = component.getSlotPath().toString();
              List<String> matchingTags = getMatchingNamespaceTags(component, tagDictionaryService, namespaceLookup);
              if (!matchingTags.isEmpty())
              {
                String tagList = String.join(", ", matchingTags);
                resultsWithTags.add(slotPath + " | " + namespaceLookup + " Tags: " + tagList);
              }
              else
              {
                resultsWithoutTags.add(slotPath);
              }
            }
    
            BComponent[] children = component.getChildComponents();
            if (children != null)
            {
              for (BComponent child : children)
              {
                visitedCount += walkComponent(child, tagDictionaryService, namespaceLookup, resultsWithTags, resultsWithoutTags, job);
              }
            }
    
            job.heartbeat();
            return visitedCount;
          }
          catch (Exception e)
          {
            job.log().message("  (Skipped component due to: " + e.getMessage() + ")");
            return visitedCount;
          }
        }
    
        private List<String> getMatchingNamespaceTags(BComponent component, BTagDictionaryService tagDictionaryService, String namespaceLookup)
        {
          List<String> matchingTags = new ArrayList<>();
    
          try
          {
            Collection<Tag> tagsCollection = tagDictionaryService.getImpliedTags(component);
    
            if (tagsCollection == null || tagsCollection.isEmpty())
            {
              return matchingTags;
            }
    
            for (Tag tag : tagsCollection)
            {
              String tagId = (tag == null || tag.getId() == null) ? null : tag.getId().toString();
              if (tagId == null)
              {
                continue;
              }
    
              String lower = tagId.toLowerCase();
              String expectedPrefix = namespaceLookup.toLowerCase() + ":";
              if (lower.startsWith(expectedPrefix))
              {
                matchingTags.add(tagId);
              }
            }
          }
          catch (Exception e)
          {
            // Skip tags we cannot read for this component.
          }
    
          return matchingTags;
        }
    
        private String resolveNamespaceLookup()
        {
          String namespace = getNamespaceLookup();
          if (namespace != null)
          {
            namespace = namespace.trim();
          }
    
          return namespace;
        }
  
          private String buildCsv(String namespaceLookup, List<String> resultsWithTags, List<String> resultsWithoutTags)
          {
            List<String[]> taggedRows = new ArrayList<>();
            int maxTagCount = 0;

            for (String result : resultsWithTags)
            {
              int separator = result.indexOf(" | " + namespaceLookup + " Tags: ");
              String slotPath = separator >= 0 ? result.substring(0, separator) : result;
              String tags = separator >= 0 ? result.substring(separator + (" | " + namespaceLookup + " Tags: ").length()) : "";
              String[] splitTags = splitTags(tags);
              taggedRows.add(buildRow(slotPath, namespaceLookup, true, splitTags));
              if (splitTags.length > maxTagCount)
              {
                maxTagCount = splitTags.length;
              }
            }

            StringBuilder csv = new StringBuilder();
            csv.append("slotPath,namespace,hasMatchingTag");
            for (int i = 0; i < maxTagCount; i++)
            {
              csv.append(',').append("tag").append(i + 1);
            }
            csv.append("\r\n");

            for (String[] row : taggedRows)
            {
              appendCsvRow(csv, row, maxTagCount);
            }

            for (String slotPath : resultsWithoutTags)
            {
              appendCsvRow(csv, buildRow(slotPath, namespaceLookup, false, new String[0]), maxTagCount);
            }

            return csv.toString();
          }

          private String[] buildRow(String slotPath, String namespaceLookup, boolean hasMatchingTag, String[] tags)
          {
            String[] row = new String[3 + tags.length];
            row[0] = slotPath;
            row[1] = namespaceLookup;
            row[2] = String.valueOf(hasMatchingTag);
            for (int i = 0; i < tags.length; i++)
            {
              row[3 + i] = tags[i];
            }
            return row;
          }

          private void appendCsvRow(StringBuilder csv, String[] row, int maxTagCount)
          {
            csv.append(csvEscape(row[0])).append(',')
               .append(csvEscape(row[1])).append(',')
               .append(csvEscape(row[2]));

            for (int i = 0; i < maxTagCount; i++)
            {
              csv.append(',');
              int tagIndex = 3 + i;
              String value = tagIndex < row.length ? row[tagIndex] : "";
              csv.append(csvEscape(value));
            }

            csv.append("\r\n");
          }

          private String[] splitTags(String tags)
          {
            if (tags == null || tags.length() == 0)
            {
              return new String[0];
            }

            String[] split = tags.split(",\\s*");
            List<String> cleaned = new ArrayList<>();
            for (int i = 0; i < split.length; i++)
            {
              String tag = split[i] == null ? "" : split[i].trim();
              if (tag.length() > 0)
              {
                cleaned.add(tag);
              }
            }
            return cleaned.toArray(new String[cleaned.size()]);
          }
  
          private BIFile writeCsvFile(String namespaceLookup, String csv)
            throws Exception
          {
            String safeNamespace = namespaceLookup.replaceAll("[^A-Za-z0-9._-]", "_");
            String fileName = "point-tags-" + safeNamespace + "-" + System.currentTimeMillis() + ".csv";
            BIFile csvFile = createFile(BOrd.make("file:^exports/" + fileName));
            if (csvFile == null)
            {
              throw new Exception("Failed creating CSV file");
            }
  
            OutputStream outputStream = null;
            Writer writer = null;
            try
            {
              outputStream = csvFile.getOutputStream();
              writer = new OutputStreamWriter(outputStream, "UTF-8");
              writer.write(csv);
            }
            finally
            {
              if (writer != null)
              {
                writer.close();
              }
              else if (outputStream != null)
              {
                outputStream.close();
              }
            }
  
            return csvFile;
          }
  
          private BIFile createFile(BOrd ord)
          {
            BIFile file = null;
  
            try
            {
              OrdQuery[] queries = ord.parse();
              FilePath filePath = (FilePath)queries[queries.length - 1];
              FilePath parentPath = filePath.getParent();
              if (parentPath != null)
              {
                try
                {
                  BFileSystem.INSTANCE.makeDir(parentPath);
                }
                catch (Exception e)
                {
                  // Directory may already exist.
                }
              }
              file = BFileSystem.INSTANCE.makeFile(filePath);
            }
            catch (Exception e)
            {
              job.log().failed("Failed creating file", e);
            }
  
            return file;
          }
  
          private String csvEscape(String value)
          {
            if (value == null)
            {
              return "";
            }
  
            // Only quote if value contains semicolon, quote, newline, or carriage return
            if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r"))
            {
              String escaped = value.replace("\"", "\"\"");
              return "\"" + escaped + "\"";
            }
  
            return value;
          }
      }
}
